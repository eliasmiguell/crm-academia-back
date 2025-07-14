"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
class UserController {
    static async getAll(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const role = req.query.role;
            const skip = (page - 1) * limit;
            const where = {};
            if (role) {
                where.role = role;
            }
            const [users, total] = await Promise.all([
                prisma_1.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                prisma_1.prisma.user.count({ where }),
            ]);
            res.json({
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const { name, email, currentPassword, newPassword } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email)
                updateData.email = email;
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ error: "Current password is required to change password" });
                }
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: req.user.id },
                });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    return res.status(400).json({ error: "Current password is incorrect" });
                }
                updateData.password = await bcryptjs_1.default.hash(newPassword, 12);
            }
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    updatedAt: true,
                },
            });
            res.json({
                message: "Profile updated successfully",
                user: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const validatedData = schema_1.registerSchema.parse(req.body);
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: validatedData.email },
            });
            if (existingUser) {
                return res.status(409).json({ error: "User already exists" });
            }
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
            const user = await prisma_1.prisma.user.create({
                data: {
                    ...validatedData,
                    password: hashedPassword,
                    role: validatedData.role || "INSTRUCTOR",
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });
            res.status(201).json({
                message: "User created successfully",
                user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { name, email, role, password } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email)
                updateData.email = email;
            if (role)
                updateData.role = role;
            if (password)
                updateData.password = await bcryptjs_1.default.hash(password, 12);
            const user = await prisma_1.prisma.user.update({
                where: { id: req.params.id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    updatedAt: true,
                },
            });
            res.json({
                message: "User updated successfully",
                user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            if (req.params.id === req.user.id) {
                return res.status(400).json({ error: "Cannot delete your own account" });
            }
            await prisma_1.prisma.user.delete({
                where: { id: req.params.id },
            });
            res.json({ message: "User deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async getInstructors(req, res, next) {
        try {
            const instructors = await prisma_1.prisma.user.findMany({
                where: {
                    role: {
                        in: ["INSTRUCTOR", "ADMIN", "MANAGER"],
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
                orderBy: { name: "asc" },
            });
            res.json(instructors);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const { id } = req.params;
            // Verify if user exists and is an instructor
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            // Get instructor statistics
            const [studentsCount, appointmentsCount, workoutPlansCount, studentsWithActivePayments] = await Promise.all([
                // Total students assigned to this instructor
                prisma_1.prisma.student.count({
                    where: { instructorId: id },
                }),
                // Total appointments for this instructor
                prisma_1.prisma.appointment.count({
                    where: { instructorId: id },
                }),
                // Total workout plans created by this instructor
                prisma_1.prisma.workoutPlan.count({
                    where: { instructorId: id },
                }),
                // Students with active payments (paid this month)
                prisma_1.prisma.student.count({
                    where: {
                        instructorId: id,
                        payments: {
                            some: {
                                status: "PAID",
                                paidDate: {
                                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                },
                            },
                        },
                    },
                }),
            ]);
            // Get recent appointments
            const recentAppointments = await prisma_1.prisma.appointment.findMany({
                where: { instructorId: id },
                orderBy: { startTime: "desc" },
                take: 5,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            // Get students with overdue payments
            const overduePayments = await prisma_1.prisma.payment.count({
                where: {
                    status: "OVERDUE",
                    student: {
                        instructorId: id,
                    },
                },
            });
            const stats = {
                studentsCount,
                appointmentsCount,
                workoutPlansCount,
                studentsWithActivePayments,
                overduePayments,
                recentAppointments,
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
