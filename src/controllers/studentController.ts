import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createStudentSchema, updateStudentSchema } from "../lib/schema"
import type { Prisma } from "@prisma/client"

export class StudentController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const search = req.query.search as string
      const status = req.query.status as string

      const skip = (page - 1) * limit

      const where: Prisma.StudentWhereInput = {}

      // Se não for ADMIN, filtrar apenas alunos do instrutor
      if (req.user!.role !== "ADMIN") {
        where.instructorId = req.user!.id
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      }

      if (status) {
        where.status = status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
      }

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
        prisma.student.count({ where }),
      ])

      res.json({
        students,
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
      const student = await prisma.student.findUnique({
        where: { id: req.params.id },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
      })

      if (!student) {
        return res.status(404).json({ error: "Student not found" })
      }

      // Se não for ADMIN, verificar se o aluno pertence ao instrutor
      if (req.user!.role !== "ADMIN" && student.instructorId !== req.user!.id) {
        return res.status(403).json({ error: "Insufficient permissions to view this student" })
      }

      res.json({ student })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createStudentSchema.parse(req.body)

      const student = await prisma.student.create({
        data: {
          ...validatedData,
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
          status: validatedData.status || "ACTIVE",
          instructorId: req.user!.id,
        },
      })

      res.status(201).json({
        message: "Student created successfully",
        student,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateStudentSchema.parse(req.body)

      // Verificar se o aluno existe e se o usuário tem permissão para editá-lo
      const existingStudent = await prisma.student.findUnique({
        where: { id: req.params.id },
        select: { instructorId: true }
      })

      if (!existingStudent) {
        return res.status(404).json({ error: "Student not found" })
      }

      // Se não for ADMIN, verificar se o aluno pertence ao instrutor
      if (req.user!.role !== "ADMIN" && existingStudent.instructorId !== req.user!.id) {
        return res.status(403).json({ error: "Insufficient permissions to edit this student" })
      }

      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: {
          ...validatedData,
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        },
      })

      res.json({
        message: "Student updated successfully",
        student,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Verificar se o aluno existe e se o usuário tem permissão para deletá-lo
      const existingStudent = await prisma.student.findUnique({
        where: { id: req.params.id },
        select: { instructorId: true }
      })

      if (!existingStudent) {
        return res.status(404).json({ error: "Student not found" })
      }

      // Apenas ADMIN pode deletar alunos
      if (req.user!.role !== "ADMIN") {
        return res.status(403).json({ error: "Insufficient permissions to delete students" })
      }

      await prisma.student.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "Estudante excluído com sucesso" })
    } catch (error) {
      next(error)
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.id

      const [totalPayments, paidPayments, pendingPayments, totalAppointments, completedAppointments, progressRecords] =
        await Promise.all([
          prisma.payment.count({ where: { studentId } }),
          prisma.payment.count({ where: { studentId, status: "PAID" } }),
          prisma.payment.count({ where: { studentId, status: "PENDING" } }),
          prisma.appointment.count({ where: { studentId } }),
          prisma.appointment.count({ where: { studentId, status: "COMPLETED" } }),
          prisma.progressRecord.count({ where: { studentId } }),
        ])

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
      }

      res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}
