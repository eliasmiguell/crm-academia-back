"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
class AppointmentController {
    static async getAll(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const type = req.query.type;
            const studentId = req.query.studentId;
            const instructorId = req.query.instructorId;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const skip = (page - 1) * limit;
            const where = {};
            if (status)
                where.status = status;
            if (type)
                where.type = type;
            if (studentId)
                where.studentId = studentId;
            if (instructorId)
                where.instructorId = instructorId;
            if (startDate || endDate) {
                where.startTime = {};
                if (startDate)
                    where.startTime.gte = new Date(startDate);
                if (endDate)
                    where.startTime.lte = new Date(endDate);
            }
            const [appointments, total] = await Promise.all([
                prisma_1.prisma.appointment.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { startTime: "desc" },
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.appointment.count({ where }),
            ]);
            res.json({
                appointments,
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
            const appointment = await prisma_1.prisma.appointment.findUnique({
                where: { id: req.params.id },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            medicalRestrictions: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            res.json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const validatedData = schema_1.createAppointmentSchema.parse(req.body);
            // Check for conflicts
            const conflictingAppointment = await prisma_1.prisma.appointment.findFirst({
                where: {
                    instructorId: validatedData.instructorId,
                    startTime: validatedData.startTime,
                    status: "SCHEDULED",
                },
            });
            if (conflictingAppointment) {
                return res.status(409).json({
                    error: "Time slot already booked",
                    message: "The instructor already has an appointment at this time",
                });
            }
            const appointment = await prisma_1.prisma.appointment.create({
                data: {
                    ...validatedData,
                    startTime: new Date(validatedData.startTime),
                    endTime: new Date(validatedData.endTime),
                    status: "SCHEDULED",
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            res.status(201).json({
                message: "Appointment created successfully",
                appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const validatedData = schema_1.updateAppointmentSchema.parse(req.body);
            const updateData = {
                ...validatedData,
                startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
            };
            const appointment = await prisma_1.prisma.appointment.update({
                where: { id: req.params.id },
                data: updateData,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            res.json({
                message: "Appointment updated successfully",
                appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await prisma_1.prisma.appointment.delete({
                where: { id: req.params.id },
            });
            res.json({ message: "Appointment deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAvailability(req, res, next) {
        try {
            const instructorId = req.params.instructorId;
            const date = req.query.date;
            if (!date) {
                return res.status(400).json({ error: "Date parameter is required" });
            }
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const appointments = await prisma_1.prisma.appointment.findMany({
                where: {
                    instructorId,
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: "SCHEDULED",
                },
                select: {
                    startTime: true,
                    endTime: true,
                },
            });
            res.json({ appointments });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const where = {};
            if (startDate || endDate) {
                where.startTime = {};
                if (startDate)
                    where.startTime.gte = new Date(startDate);
                if (endDate)
                    where.startTime.lte = new Date(endDate);
            }
            const [totalAppointments, scheduledAppointments, completedAppointments, cancelledAppointments, noShowAppointments,] = await Promise.all([
                prisma_1.prisma.appointment.count({ where }),
                prisma_1.prisma.appointment.count({ where: { ...where, status: "SCHEDULED" } }),
                prisma_1.prisma.appointment.count({ where: { ...where, status: "COMPLETED" } }),
                prisma_1.prisma.appointment.count({ where: { ...where, status: "CANCELLED" } }),
                prisma_1.prisma.appointment.count({ where: { ...where, status: "NO_SHOW" } }),
            ]);
            const stats = {
                total: totalAppointments,
                scheduled: scheduledAppointments,
                completed: completedAppointments,
                cancelled: cancelledAppointments,
                noShow: noShowAppointments,
                attendanceRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AppointmentController = AppointmentController;
