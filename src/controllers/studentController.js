"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
class StudentController {
    static async getAll(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }
            if (status) {
                where.status = status;
            }
            const [students, total] = await Promise.all([
                prisma_1.prisma.student.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        payments: {
                            where: { status: "PENDING" },
                            take: 1,
                        },
                        appointments: {
                            where: {
                                startTime: { gte: new Date() },
                                status: "SCHEDULED",
                            },
                            take: 1,
                        },
                    },
                }),
                prisma_1.prisma.student.count({ where }),
            ]);
            res.json({
                students,
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
    static async getById(req, res, next) {
        try {
            const student = await prisma_1.prisma.student.findUnique({
                where: { id: req.params.id },
                include: {
                    payments: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                    appointments: {
                        orderBy: { startTime: "desc" },
                        take: 10,
                        include: {
                            instructor: {
                                select: { name: true },
                            },
                        },
                    },
                    progressRecords: {
                        orderBy: { createdAt: "desc" },
                        take: 5,
                    },
                    workoutPlans: {
                        where: { status: "ACTIVE" },
                        include: {
                            exercises: true,
                            instructor: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });
            if (!student) {
                return res.status(404).json({ error: "Student not found" });
            }
            res.json({ student });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const validatedData = schema_1.createStudentSchema.parse(req.body);
            const student = await prisma_1.prisma.student.create({
                data: {
                    ...validatedData,
                    dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
                    status: validatedData.status || "ACTIVE",
                    instructorId: req.user.id,
                },
            });
            res.status(201).json({
                message: "Student created successfully",
                student,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const validatedData = schema_1.updateStudentSchema.parse(req.body);
            const student = await prisma_1.prisma.student.update({
                where: { id: req.params.id },
                data: {
                    ...validatedData,
                    dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
                },
            });
            res.json({
                message: "Student updated successfully",
                student,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await prisma_1.prisma.student.delete({
                where: { id: req.params.id },
            });
            res.json({ message: "Student deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const studentId = req.params.id;
            const [totalPayments, paidPayments, pendingPayments, totalAppointments, completedAppointments, progressRecords] = await Promise.all([
                prisma_1.prisma.payment.count({ where: { studentId } }),
                prisma_1.prisma.payment.count({ where: { studentId, status: "PAID" } }),
                prisma_1.prisma.payment.count({ where: { studentId, status: "PENDING" } }),
                prisma_1.prisma.appointment.count({ where: { studentId } }),
                prisma_1.prisma.appointment.count({ where: { studentId, status: "COMPLETED" } }),
                prisma_1.prisma.progressRecord.count({ where: { studentId } }),
            ]);
            const stats = {
                payments: {
                    total: totalPayments,
                    paid: paidPayments,
                    pending: pendingPayments,
                },
                appointments: {
                    total: totalAppointments,
                    completed: completedAppointments,
                    attendanceRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
                },
                progressRecords,
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentController = StudentController;
