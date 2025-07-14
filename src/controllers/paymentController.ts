import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createPaymentSchema, updatePaymentSchema } from "../lib/schema"
import { Prisma, PaymentStatus } from "@prisma/client"
import { sendMail } from "../services/emailService";

type PaymentWhereInput = {
  status?: PaymentStatus
  studentId?: string
  dueDate?: {
    gte?: Date
    lte?: Date
  }
}

export class PaymentController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const status = req.query.status as PaymentStatus
      const studentId = req.query.studentId as string
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      const skip = (page - 1) * limit

      const where: PaymentWhereInput = {}

      if (status) {
        where.status = status
      }

      if (studentId) {
        where.studentId = studentId
      }

      if (startDate || endDate) {
        where.dueDate = {}
        if (startDate) where.dueDate.gte = new Date(startDate)
        if (endDate) where.dueDate.lte = new Date(endDate)
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { dueDate: "desc" },
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
        prisma.payment.count({ where }),
      ])

      res.json({
        payments,
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
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
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

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" })
      }

      res.json(payment)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createPaymentSchema.parse(req.body)

      const payment = await prisma.payment.create({
        data: {
          ...validatedData,
          dueDate: new Date(validatedData.dueDate),
          status: "PENDING",
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

      // Enviar e-mail de cobrança ao aluno
      // if (payment.student?.email) {
      //   await sendMail({
      //     to: payment.student.email,
      //     subject: `Cobrança de pagamento - ${payment.student.name}`,
      //     text: `Olá ${payment.student.name},\n\nVocê possui um pagamento no valor de R$ ${Number(payment.amount).toFixed(2)} com vencimento em ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}.\n\nPor favor, realize o pagamento até a data de vencimento.\n\nObrigado!`,
      //   });
      // }

      res.status(201).json({
        message: "Payment created successfully",
        payment,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updatePaymentSchema.parse(req.body)

      // Destructure to separate paidAt from other fields
      const { paidAt, ...otherFields } = validatedData

      // Remove paidAt from otherFields if it exists and create updateData
      const updateData: Prisma.PaymentUpdateInput = { 
        ...otherFields,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      }

      // Remove paidAt from updateData if it exists (safety check)
      if ('paidAt' in updateData) {
        delete updateData.paidAt
      }

      // Handle paidDate logic
      if (paidAt) {
        // If paidAt is provided, use it
        updateData.paidDate = new Date(paidAt)
      } else if (validatedData.status === "PAID") {
        // If marking as paid but no paidAt provided, set current timestamp
        updateData.paidDate = new Date()
      }

      const payment = await prisma.payment.update({
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
        },
      })

      res.json({
        message: "Payment updated successfully",
        payment,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.payment.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "Payment deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      const where: PaymentWhereInput = {}

      if (startDate || endDate) {
        where.dueDate = {}
        if (startDate) where.dueDate.gte = new Date(startDate)
        if (endDate) where.dueDate.lte = new Date(endDate)
      }

      const [
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalPayments,
        paidPayments,
        pendingPayments,
        overduePayments,
      ] = await Promise.all([
        prisma.payment.aggregate({
          where: { ...where, status: "PAID" },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { ...where, status: "PENDING" },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { ...where, status: "OVERDUE" },
          _sum: { amount: true },
        }),
        prisma.payment.count({ where }),
        prisma.payment.count({ where: { ...where, status: "PAID" } }),
        prisma.payment.count({ where: { ...where, status: "PENDING" } }),
        prisma.payment.count({ where: { ...where, status: "OVERDUE" } }),
      ])

      const stats = {
        revenue: {
          total: Number(totalRevenue._sum.amount || 0),
          pending: Number(pendingAmount._sum.amount || 0),
          overdue: Number(overdueAmount._sum.amount || 0),
        },
        payments: {
          total: totalPayments,
          paid: paidPayments,
          pending: pendingPayments,
          overdue: overduePayments,
        },
      }

      res.json(stats)
    } catch (error) {
      next(error)
    }
  }

  static async markOverdue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await prisma.payment.updateMany({
        where: {
          status: "PENDING",
          dueDate: {
            lt: new Date(),
          },
        },
        data: {
          status: "OVERDUE",
        },
      })

      res.json({
        message: `${result.count} payments marked as overdue`,
        count: result.count,
      })
    } catch (error) {
      next(error)
    }
  }

  static async sendChargeEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          student: {
            select: { name: true, email: true },
          },
        },
      });
      if (!payment || !payment.student?.email) {
        return res.status(404).json({ error: "Pagamento ou aluno não encontrado" });
      }
      await sendMail({
        to: payment.student.email,
        subject: `Cobrança de pagamento - ${payment.student.name}`,
        html: `<h2>Olá ${payment.student.name},</h2><p>Você possui um pagamento no valor de <strong>R$ ${Number(payment.amount).toFixed(2)}</strong> com vencimento em <strong>${new Date(payment.dueDate).toLocaleDateString('pt-BR')}</strong>.</p><p>Por favor, realize o pagamento até a data de vencimento.</p><p>Obrigado!</p>`,
      });
      res.json({ message: "E-mail de cobrança enviado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }
}
