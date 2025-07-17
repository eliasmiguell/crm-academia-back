import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createNotificationSchema } from "../lib/schema"
import { Prisma, NotificationType } from "@prisma/client"

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const type = req.query.type as NotificationType
      const isRead = req.query.isRead === "true"

      const skip = (page - 1) * limit

      const where: Prisma.NotificationWhereInput = {}

      // Admin vê todas as notificações, outros usuários veem apenas as suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
      }

      if (type) where.type = type
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
      const where: Prisma.NotificationWhereInput = {
        id: req.params.id,
      }

      // Admin pode ver qualquer notificação, outros usuários apenas as suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
      }

      const notification = await prisma.notification.findFirst({
        where,
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
      const where: Prisma.NotificationWhereInput = {
        id: req.params.id,
      }

      // Admin pode marcar qualquer notificação como lida, outros usuários apenas as suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
      }

      const notification = await prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
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
      const where: Prisma.NotificationWhereInput = {
        isRead: false,
      }

      // Admin pode marcar todas as notificações como lidas, outros usuários apenas as suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
      }

      const result = await prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
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
      const where: Prisma.NotificationWhereInput = {
        id: req.params.id,
      }

      // Admin pode deletar qualquer notificação, outros usuários apenas as suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
      }

      const result = await prisma.notification.deleteMany({
        where,
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
      const where: Prisma.NotificationWhereInput = {}
      const whereUnread: Prisma.NotificationWhereInput = { isRead: false }
      const whereUrgent: Prisma.NotificationWhereInput = { 
        type: NotificationType.PAYMENT_OVERDUE, 
        isRead: false 
      }

      // Admin vê estatísticas de todas as notificações, outros usuários apenas das suas
      if (req.user!.role !== "ADMIN") {
        where.userId = req.user!.id
        whereUnread.userId = req.user!.id
        whereUrgent.userId = req.user!.id
      }

      const [totalNotifications, unreadNotifications, urgentNotifications, notificationsByType] =
        await Promise.all([
          prisma.notification.count({ where }),
          prisma.notification.count({ where: whereUnread }),
          prisma.notification.count({ where: whereUrgent }),
          prisma.notification.groupBy({
            by: ["type"],
            where,
            _count: true,
          }),
        ])

      const stats = {
        total: totalNotifications,
        unread: unreadNotifications,
        urgent: urgentNotifications,
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
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      
      // Construir filtro baseado no papel do usuário
      const paymentWhere: Prisma.PaymentWhereInput = {
        OR: [
          { status: "OVERDUE" },
          {
            status: "PENDING",
            dueDate: {
              lt: today
            }
          }
        ]
      }

      // Se não for admin, filtrar apenas pagamentos dos alunos do instrutor
      if (req.user!.role !== "ADMIN") {
        paymentWhere.student = {
          instructorId: req.user!.id
        }
      }
      
      const overduePayments = await prisma.payment.findMany({
        where: paymentWhere,
        include: {
          student: true,
        },
      })

      // First, update the status of pending payments that are overdue
      const pendingOverduePayments = overduePayments.filter(p => p.status === "PENDING" && p.dueDate < today)
      if (pendingOverduePayments.length > 0) {
        await prisma.payment.updateMany({
          where: {
            id: {
              in: pendingOverduePayments.map(p => p.id)
            }
          },
          data: {
            status: "OVERDUE"
          }
        })
      }

      const notifications = await Promise.all(
        overduePayments.map((payment) =>
          prisma.notification.create({
            data: {
              type: NotificationType.PAYMENT_OVERDUE,
              title: "Pagamento em Atraso",
              message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} está em atraso desde ${payment.dueDate.toLocaleDateString("pt-BR")}`,
              userId: req.user!.id,
              studentId: payment.studentId,
              isRead: false,
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

      // Construir filtro baseado no papel do usuário
      const studentWhere: Prisma.StudentWhereInput = {
        dateOfBirth: {
          not: null,
        },
      }

      // Se não for admin, filtrar apenas alunos do instrutor
      if (req.user!.role !== "ADMIN") {
        studentWhere.instructorId = req.user!.id
      }

      const birthdayStudents = await prisma.student.findMany({
        where: studentWhere,
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
              type: NotificationType.BIRTHDAY,
              title: "Aniversário",
              message: `Hoje é aniversário de ${student.name}! 🎉`,
              userId: req.user!.id,
              studentId: student.id,
              isRead: false,
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

  static async createPaymentDueNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = new Date()
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      
      // Construir filtro baseado no papel do usuário
      const paymentWhere: Prisma.PaymentWhereInput = {
        status: "PENDING",
        dueDate: {
          gte: today,
          lte: threeDaysFromNow
        }
      }

      // Se não for admin, filtrar apenas pagamentos dos alunos do instrutor
      if (req.user!.role !== "ADMIN") {
        paymentWhere.student = {
          instructorId: req.user!.id
        }
      }
      
      const duePayments = await prisma.payment.findMany({
        where: paymentWhere,
        include: {
          student: true,
        },
      })

      const notifications = await Promise.all(
        duePayments.map((payment) =>
          prisma.notification.create({
            data: {
              type: NotificationType.PAYMENT_DUE,
              title: "Pagamento Próximo do Vencimento",
              message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} vence em ${payment.dueDate.toLocaleDateString("pt-BR")}`,
              userId: req.user!.id,
              studentId: payment.studentId,
              isRead: false,
            },
          }),
        ),
      )

      res.json({
        message: `${notifications.length} notifications created for due payments`,
        count: notifications.length,
      })
    } catch (error) {
      next(error)
    }
  }
}
