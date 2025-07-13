import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createWorkoutPlanSchema } from "../lib/schema"

export class WorkoutPlanController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const studentId = req.query.studentId as string
      const instructorId = req.query.instructorId as string
      const isActive = req.query.isActive === "true"

      const skip = (page - 1) * limit

      const where: any = {}

      if (studentId) where.studentId = studentId
      if (instructorId) where.instructorId = instructorId
      if (isActive !== undefined) where.isActive = isActive

      const [workoutPlans, total] = await Promise.all([
        prisma.workoutPlan.findMany({
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
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            exercises: true,
          },
        }),
        prisma.workoutPlan.count({ where }),
      ])

      res.json({
        workoutPlans,
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
      const workoutPlan = await prisma.workoutPlan.findUnique({
        where: { id: req.params.id },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              objectives: true,
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
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      })

      if (!workoutPlan) {
        return res.status(404).json({ error: "Workout plan not found" })
      }

      res.json(workoutPlan)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createWorkoutPlanSchema.parse(req.body)

      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          studentId: validatedData.studentId,
          instructorId: validatedData.instructorId,
          isActive: true,
          exercises: {
            create: validatedData.exercises.map((exercise, index) => ({
              ...exercise,
              order: index + 1,
            })),
          },
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
          exercises: true,
        },
      })

      res.status(201).json({
        message: "Workout plan created successfully",
        workoutPlan,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createWorkoutPlanSchema.partial().parse(req.body)

      const updateData: any = {
        name: validatedData.name,
        description: validatedData.description,
        studentId: validatedData.studentId,
        instructorId: validatedData.instructorId,
      }

      if (validatedData.exercises) {
        await prisma.exercise.deleteMany({
          where: { workoutPlanId: req.params.id },
        })

        updateData.exercises = {
          create: validatedData.exercises.map((exercise, index) => ({
            ...exercise,
            order: index + 1,
          })),
        }
      }

      const workoutPlan = await prisma.workoutPlan.update({
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
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      })

      res.json({
        message: "Workout plan updated successfully",
        workoutPlan,
      })
    } catch (error) {
      next(error)
    }
  }

  static async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workoutPlan = await prisma.workoutPlan.findUnique({
        where: { id: req.params.id },
        select: { isActive: true },
      })

      if (!workoutPlan) {
        return res.status(404).json({ error: "Workout plan not found" })
      }

      const updatedWorkoutPlan = await prisma.workoutPlan.update({
        where: { id: req.params.id },
        data: { isActive: !workoutPlan.isActive },
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
      })

      res.json({
        message: `Workout plan ${updatedWorkoutPlan.isActive ? "activated" : "deactivated"} successfully`,
        workoutPlan: updatedWorkoutPlan,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.workoutPlan.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "Workout plan deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async copy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { studentId, name } = req.body

      if (!studentId || !name) {
        return res.status(400).json({ error: "Student ID and name are required" })
      }

      const originalPlan = await prisma.workoutPlan.findUnique({
        where: { id: req.params.id },
        include: {
          exercises: true,
        },
      })

      if (!originalPlan) {
        return res.status(404).json({ error: "Workout plan not found" })
      }

      const copiedPlan = await prisma.workoutPlan.create({
        data: {
          name,
          description: originalPlan.description,
          studentId,
          instructorId: originalPlan.instructorId,
          isActive: true,
          exercises: {
            create: originalPlan.exercises.map((exercise) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              notes: exercise.notes,
              order: exercise.order,
            })),
          },
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
          exercises: true,
        },
      })

      res.status(201).json({
        message: "Workout plan copied successfully",
        workoutPlan: copiedPlan,
      })
    } catch (error) {
      next(error)
    }
  }
}
