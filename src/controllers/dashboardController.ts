import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"

export class DashboardController {
  static async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [
        totalStudents,
        activeStudents,
        totalRevenue,
        pendingPayments,
        todayAppointments,
        thisWeekAppointments,
        unreadNotifications,
        recentProgressRecords,
      ] = await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { status: "ACTIVE" } }),
        prisma.payment.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        }),
        prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.appointment.count({
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
            status: "SCHEDULED",
          },
        }),
        prisma.appointment.count({
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
              lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)),
            },
            status: "SCHEDULED",
          },
        }),
        prisma.notification.count({ where: { isRead: false } }),
        prisma.progressRecord.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        }),
      ])

      const stats = {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: totalStudents - activeStudents,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          pendingPayments,
        },
        appointments: {
          today: todayAppointments,
          thisWeek: thisWeekAppointments,
        },
        notifications: {
          unread: unreadNotifications,
        },
        progress: {
          recentRecords: recentProgressRecords,
        },
      }

      res.json(stats)
    } catch (error) {
      next(error)
    }
  }

  static async getRecentActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number.parseInt(req.query.limit as string) || 10

      const [recentPayments, recentAppointments, recentStudents] = await Promise.all([
        prisma.payment.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            student: {
              select: { name: true },
            },
          },
        }),
        prisma.appointment.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            student: {
              select: { name: true },
            },
          },
        }),
        prisma.student.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        }),
      ])

      const activities = [
        ...recentPayments.map((payment) => ({
          type: "payment",
          id: payment.id,
          description: `Pagamento de ${payment.student.name} - R$ ${payment.amount}`,
          status: payment.status,
          createdAt: payment.createdAt,
        })),
        ...recentAppointments.map((appointment) => ({
          type: "appointment",
          id: appointment.id,
          description: `Agendamento com ${appointment.student.name}`,
          status: appointment.status,
          createdAt: appointment.createdAt,
        })),
        ...recentStudents.map((student) => ({
          type: "student",
          id: student.id,
          description: `Novo aluno: ${student.name}`,
          status: "new",
          createdAt: student.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)

      res.json(activities)
    } catch (error) {
      next(error)
    }
  }

  static async getRevenueChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = Number.parseInt(req.query.months as string) || 12
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - months)

      const payments = await prisma.payment.findMany({
        where: {
          status: "PAID",
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          amount: true,
          paidAt: true,
        },
      })

      const monthlyRevenue = payments.reduce(
        (acc, payment) => {
          if (!payment.paidAt) return acc

          const monthKey = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, "0")}`
          acc[monthKey] = (acc[monthKey] || 0) + payment.amount
          return acc
        },
        {} as Record<string, number>,
      )

      const chartData = []
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        chartData.push({
          month: monthKey,
          revenue: monthlyRevenue[monthKey] || 0,
        })
      }

      res.json(chartData)
    } catch (error) {
      next(error)
    }
  }

  static async getStudentGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = Number.parseInt(req.query.months as string) || 12
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - months)

      const students = await prisma.student.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      })

      const monthlyGrowth = students.reduce(
        (acc, student) => {
          const monthKey = `${student.createdAt.getFullYear()}-${String(student.createdAt.getMonth() + 1).padStart(2, "0")}`
          acc[monthKey] = (acc[monthKey] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const chartData = []
      let cumulative = 0

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        const newStudents = monthlyGrowth[monthKey] || 0
        cumulative += newStudents

        chartData.push({
          month: monthKey,
          newStudents,
          totalStudents: cumulative,
        })
      }

      res.json(chartData)
    } catch (error) {
      next(error)
    }
  }
}
