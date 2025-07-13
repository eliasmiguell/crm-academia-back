import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createNotificationSchema } from "../lib/schema"

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const type = req.query.type as string
      const priority = req.query.priority as string
      const isRead = req.query.isRead === "true"

      const skip = (page - 1) * limit

      const where: any = {
        userId: req.user!.id,
      }

      if (type) where.type = type
      if (priority) where.priority = priority
      if (isRead !== undefined) where.isRead = isRead

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
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
        prisma.notification.count({ where }),
      ])

      res.json({
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id,
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
      })

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" })
      }

      res.json(notification)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createNotificationSchema.parse(req.body)

      const notification = await prisma.notification.create({
        data: {
          ...validatedData,
          priority: validatedData.priority || "MEDIUM",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      res.status(201).json({
        message: "Notification created successfully",
        notification,
      })
    } catch (error) {
      next(error)
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      if (notification.count === 0) {
        return res.status(404).json({ error: "Notification not found" })
      }

      res.json({ message: "Notification marked as read" })
    } catch (error) {
      next(error)
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      res.json({
        message: `${result.count} notifications marked as read`,
        count: result.count,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
      })

      if (result.count === 0) {
        return res.status(404).json({ error: "Notification not found" })
      }

      res.json({ message: "Notification deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalNotifications, unreadNotifications, highPriorityNotifications, notificationsByType] =
        await Promise.all([
          prisma.notification.count({
            where: { userId: req.user!.id },
          }),
          prisma.notification.count({
            where: { userId: req.user!.id, isRead: false },
          }),
          prisma.notification.count({
            where: { userId: req.user!.id, priority: "HIGH", isRead: false },
          }),
          prisma.notification.groupBy({
            by: ["type"],
            where: { userId: req.user!.id },
            _count: true,
          }),
        ])

      const stats = {
        total: totalNotifications,
        unread: unreadNotifications,
        highPriority: highPriorityNotifications,
        byType: notificationsByType.reduce(
          (acc, item) => {
            acc[item.type] = item._count
            return acc
          },
          {} as Record<string, number>,
        ),
      }

      res.json(stats)
    } catch (error) {
      next(error)
    }
  }

  static async createPaymentOverdueNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overduePayments = await prisma.payment.findMany({
        where: {
          status: "OVERDUE",
        },
        include: {
          student: true,
        },
      })

      const notifications = await Promise.all(
        overduePayments.map((payment) =>
          prisma.notification.create({
            data: {
              type: "PAYMENT",
              title: "Pagamento em Atraso",
              message: `O pagamento de ${payment.student.name} no valor de R$ ${payment.amount} está em atraso desde ${payment.dueDate.toLocaleDateString("pt-BR")}`,
              priority: "HIGH",
              studentId: payment.studentId,
              userId: req.user!.id,
            },
          }),
        ),
      )

      res.json({
        message: `${notifications.length} notifications created for overdue payments`,
        count: notifications.length,
      })
    } catch (error) {
      next(error)
    }
  }

  static async createBirthdayNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = new Date()
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()

      const birthdayStudents = await prisma.student.findMany({
        where: {
          dateOfBirth: {
            not: null,
          },
        },
      })

      const todayBirthdays = birthdayStudents.filter((student) => {
        if (!student.dateOfBirth) return false
        const birthDate = new Date(student.dateOfBirth)
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay
      })

      const notifications = await Promise.all(
        todayBirthdays.map((student) =>
          prisma.notification.create({
            data: {
              type: "BIRTHDAY",
              title: "Aniversário",
              message: `Hoje é aniversário de ${student.name}! 🎉`,
              priority: "LOW",
              studentId: student.id,
              userId: req.user!.id,
            },
          }),
        ),
      )

      res.json({
        message: `${notifications.length} birthday notifications created`,
        count: notifications.length,
      })
    } catch (error) {
      next(error)
    }
  }
}
