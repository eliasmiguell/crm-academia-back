import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createProgressSchema } from "../lib/schema"
import { Prisma } from "@prisma/client"

export class ProgressController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const studentId = req.query.studentId as string
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      const skip = (page - 1) * limit

      const where: Prisma.ProgressRecordWhereInput = {}

      // Se não for ADMIN, filtrar apenas progresso dos alunos do instrutor
      if (req.user!.role !== "ADMIN") {
        // Buscar IDs dos alunos do instrutor
        const instructorStudents = await prisma.student.findMany({
          where: { instructorId: req.user!.id },
          select: { id: true }
        })
        const studentIds = instructorStudents.map(s => s.id)
        where.studentId = { in: studentIds }
      }

      if (studentId) {
        where.studentId = studentId
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = new Date(startDate)
        if (endDate) where.createdAt.lte = new Date(endDate)
      }

      const [progressRecords, total] = await Promise.all([
        prisma.progressRecord.findMany({
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
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.progressRecord.count({ where }),
      ])

      res.json({
        progressRecords,
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
      const progressRecord = await prisma.progressRecord.findUnique({
        where: { id: req.params.id },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              dateOfBirth: true,
              instructorId: true,
            },
          },
        },
      })

      if (!progressRecord) {
        return res.status(404).json({ error: "Progress record not found" })
      }

      // Se não for ADMIN, verificar se o progresso pertence a um aluno do instrutor
      if (req.user!.role !== "ADMIN" && progressRecord.student.instructorId !== req.user!.id) {
        return res.status(403).json({ error: "Insufficient permissions to view this progress record" })
      }

      res.json(progressRecord)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createProgressSchema.parse(req.body)

      // Se não for ADMIN, verificar se o aluno pertence ao instrutor
      if (req.user!.role !== "ADMIN") {
        const student = await prisma.student.findUnique({
          where: { id: validatedData.studentId },
          select: { instructorId: true }
        })

        if (!student || student.instructorId !== req.user!.id) {
          return res.status(403).json({ error: "Insufficient permissions to create progress record for this student" })
        }
      }

      const progressRecord = await prisma.progressRecord.create({
        data: {
          ...validatedData,
          recordDate: new Date(),
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
        message: "Progress record created successfully",
        progressRecord,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createProgressSchema.partial().parse(req.body)

      // Verificar se o progresso existe e se o usuário tem permissão para editá-lo
      const existingProgress = await prisma.progressRecord.findUnique({
        where: { id: req.params.id },
        include: {
          student: {
            select: { instructorId: true }
          }
        }
      })

      if (!existingProgress) {
        return res.status(404).json({ error: "Progress record not found" })
      }

      // Se não for ADMIN, verificar se o progresso pertence a um aluno do instrutor
      if (req.user!.role !== "ADMIN" && existingProgress.student.instructorId !== req.user!.id) {
        return res.status(403).json({ error: "Insufficient permissions to edit this progress record" })
      }

      const progressRecord = await prisma.progressRecord.update({
        where: { id: req.params.id },
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

      res.json({
        message: "Progress record updated successfully",
        progressRecord,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Verificar se o progresso existe e se o usuário tem permissão para deletá-lo
      const existingProgress = await prisma.progressRecord.findUnique({
        where: { id: req.params.id },
        include: {
          student: {
            select: { instructorId: true }
          }
        }
      })

      if (!existingProgress) {
        return res.status(404).json({ error: "Progress record not found" })
      }

      // Se não for ADMIN, verificar se o progresso pertence a um aluno do instrutor
      if (req.user!.role !== "ADMIN" && existingProgress.student.instructorId !== req.user!.id) {
        return res.status(403).json({ error: "Insufficient permissions to delete this progress record" })
      }

      await prisma.progressRecord.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "Progress record deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async getStudentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId

      const progressRecords = await prisma.progressRecord.findMany({
        where: { studentId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          weight: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
        },
      })

      // Calculate progress trends
      const trends = {
        weight: ProgressController.calculateTrend(
          progressRecords
            .filter((r) => r.weight !== null)
            .map((r) => ({ date: r.createdAt, value: Number(r.weight) })),
        ),
        bodyFat: ProgressController.calculateTrend(
          progressRecords
            .filter((r) => r.bodyFat !== null)
            .map((r) => ({ date: r.createdAt, value: Number(r.bodyFat) })),
        ),
        muscleMass: ProgressController.calculateTrend(
          progressRecords
            .filter((r) => r.muscleMass !== null)
            .map((r) => ({ date: r.createdAt, value: Number(r.muscleMass) })),
        ),
      }

      res.json({
        progressRecords,
        trends,
      })
    } catch (error) {
      next(error)
    }
  }

  private static calculateTrend(data: { date: Date; value: number }[]) {
    if (data.length < 2) return { trend: "stable", change: 0 }

    const latest = data[data.length - 1]
    const previous = data[data.length - 2]

    const change = latest.value - previous.value
    const percentChange = (change / previous.value) * 100

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      change: Number(change.toFixed(2)),
      percentChange: Number(percentChange.toFixed(2)),
    }
  }
}
