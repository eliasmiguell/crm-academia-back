"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
const client_1 = require("@prisma/client");
class NotificationController {
    static async getAll(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const type = req.query.type;
            const isRead = req.query.isRead === "true";
            const skip = (page - 1) * limit;
            const where = {
                userId: req.user.id,
            };
            if (type)
                where.type = type;
            if (isRead !== undefined)
                where.isRead = isRead;
            const [notifications, total] = await Promise.all([
                prisma_1.prisma.notification.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.notification.count({ where }),
            ]);
            res.json({
                notifications,
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
            const notification = await prisma_1.prisma.notification.findFirst({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
            if (!notification) {
                return res.status(404).json({ error: "Notification not found" });
            }
            res.json(notification);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const validatedData = schema_1.createNotificationSchema.parse(req.body);
            const notification = await prisma_1.prisma.notification.create({
                data: validatedData,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            res.status(201).json({
                message: "Notification created successfully",
                notification,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const notification = await prisma_1.prisma.notification.updateMany({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
                data: {
                    isRead: true,
                },
            });
            if (notification.count === 0) {
                return res.status(404).json({ error: "Notification not found" });
            }
            res.json({ message: "Notification marked as read" });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const result = await prisma_1.prisma.notification.updateMany({
                where: {
                    userId: req.user.id,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });
            res.json({
                message: `${result.count} notifications marked as read`,
                count: result.count,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const result = await prisma_1.prisma.notification.deleteMany({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
            });
            if (result.count === 0) {
                return res.status(404).json({ error: "Notification not found" });
            }
            res.json({ message: "Notification deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const [totalNotifications, unreadNotifications, urgentNotifications, notificationsByType] = await Promise.all([
                prisma_1.prisma.notification.count({
                    where: { userId: req.user.id },
                }),
                prisma_1.prisma.notification.count({
                    where: { userId: req.user.id, isRead: false },
                }),
                prisma_1.prisma.notification.count({
                    where: { userId: req.user.id, type: client_1.NotificationType.PAYMENT_OVERDUE, isRead: false },
                }),
                prisma_1.prisma.notification.groupBy({
                    by: ["type"],
                    where: { userId: req.user.id },
                    _count: true,
                }),
            ]);
            const stats = {
                total: totalNotifications,
                unread: unreadNotifications,
                urgent: urgentNotifications,
                byType: notificationsByType.reduce((acc, item) => {
                    acc[item.type] = item._count;
                    return acc;
                }, {}),
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPaymentOverdueNotifications(req, res, next) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const overduePayments = await prisma_1.prisma.payment.findMany({
                where: {
                    OR: [
                        { status: "OVERDUE" },
                        {
                            status: "PENDING",
                            dueDate: {
                                lt: today
                            }
                        }
                    ]
                },
                include: {
                    student: true,
                },
            });
            // First, update the status of pending payments that are overdue
            const pendingOverduePayments = overduePayments.filter(p => p.status === "PENDING" && p.dueDate < today);
            if (pendingOverduePayments.length > 0) {
                await prisma_1.prisma.payment.updateMany({
                    where: {
                        id: {
                            in: pendingOverduePayments.map(p => p.id)
                        }
                    },
                    data: {
                        status: "OVERDUE"
                    }
                });
            }
            const notifications = await Promise.all(overduePayments.map((payment) => prisma_1.prisma.notification.create({
                data: {
                    type: client_1.NotificationType.PAYMENT_OVERDUE,
                    title: "Pagamento em Atraso",
                    message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} está em atraso desde ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                    userId: req.user.id,
                    studentId: payment.studentId,
                    isRead: false,
                },
            })));
            res.json({
                message: `${notifications.length} notifications created for overdue payments`,
                count: notifications.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createBirthdayNotifications(req, res, next) {
        try {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDay = today.getDate();
            const birthdayStudents = await prisma_1.prisma.student.findMany({
                where: {
                    dateOfBirth: {
                        not: null,
                    },
                },
            });
            const todayBirthdays = birthdayStudents.filter((student) => {
                if (!student.dateOfBirth)
                    return false;
                const birthDate = new Date(student.dateOfBirth);
                return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
            });
            const notifications = await Promise.all(todayBirthdays.map((student) => prisma_1.prisma.notification.create({
                data: {
                    type: client_1.NotificationType.BIRTHDAY,
                    title: "Aniversário",
                    message: `Hoje é aniversário de ${student.name}! 🎉`,
                    userId: req.user.id,
                    studentId: student.id,
                    isRead: false,
                },
            })));
            res.json({
                message: `${notifications.length} birthday notifications created`,
                count: notifications.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPaymentDueNotifications(req, res, next) {
        try {
            const today = new Date();
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const duePayments = await prisma_1.prisma.payment.findMany({
                where: {
                    status: "PENDING",
                    dueDate: {
                        gte: today,
                        lte: threeDaysFromNow
                    }
                },
                include: {
                    student: true,
                },
            });
            const notifications = await Promise.all(duePayments.map((payment) => prisma_1.prisma.notification.create({
                data: {
                    type: client_1.NotificationType.PAYMENT_DUE,
                    title: "Pagamento Próximo do Vencimento",
                    message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} vence em ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                    userId: req.user.id,
                    studentId: payment.studentId,
                    isRead: false,
                },
            })));
            res.json({
                message: `${notifications.length} notifications created for due payments`,
                count: notifications.length,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
