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
            },
          },
        },
      })

      if (!progressRecord) {
        return res.status(404).json({ error: "Progress record not found" })
      }

      res.json(progressRecord)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createProgressSchema.parse(req.body)

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
