import type { Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { createAppointmentSchema, updateAppointmentSchema } from "../lib/schema"
import { Prisma, AppointmentStatus, AppointmentType } from "@prisma/client"

export class AppointmentController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const status = req.query.status as AppointmentStatus
      const type = req.query.type as AppointmentType
      const studentId = req.query.studentId as string
      const instructorId = req.query.instructorId as string
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      const skip = (page - 1) * limit

      const where: Prisma.AppointmentWhereInput = {}

      if (status) where.status = status
      if (type) where.type = type
      if (studentId) where.studentId = studentId
      if (instructorId) where.instructorId = instructorId

      if (startDate || endDate) {
        where.startTime = {}
        if (startDate) where.startTime.gte = new Date(startDate)
        if (endDate) where.startTime.lte = new Date(endDate)
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
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
        prisma.appointment.count({ where }),
      ])

      res.json({
        appointments,
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
      const appointment = await prisma.appointment.findUnique({
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
      })

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" })
      }

      res.json(appointment)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createAppointmentSchema.parse(req.body)

      // Check for conflicts
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          instructorId: validatedData.instructorId,
          startTime: validatedData.startTime,
          status: "SCHEDULED",
        },
      })

      if (conflictingAppointment) {
        return res.status(409).json({
          error: "Time slot already booked",
          message: "The instructor already has an appointment at this time",
        })
      }

      const appointment = await prisma.appointment.create({
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
      })

      res.status(201).json({
        message: "Appointment created successfully",
        appointment,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateAppointmentSchema.parse(req.body)

      const updateData = {
        ...validatedData,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
      }

      const appointment = await prisma.appointment.update({
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
      })

      res.json({
        message: "Appointment updated successfully",
        appointment,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.appointment.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "Appointment deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async getAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const instructorId = req.params.instructorId
      const date = req.query.date as string

      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" })
      }

      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const appointments = await prisma.appointment.findMany({
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
      })

      res.json({ appointments })
    } catch (error) {
      next(error)
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      const where: Prisma.AppointmentWhereInput = {}

      if (startDate || endDate) {
        where.startTime = {}
        if (startDate) where.startTime.gte = new Date(startDate)
        if (endDate) where.startTime.lte = new Date(endDate)
      }

      const [
        totalAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
      ] = await Promise.all([
        prisma.appointment.count({ where }),
        prisma.appointment.count({ where: { ...where, status: "SCHEDULED" } }),
        prisma.appointment.count({ where: { ...where, status: "COMPLETED" } }),
        prisma.appointment.count({ where: { ...where, status: "CANCELLED" } }),
        prisma.appointment.count({ where: { ...where, status: "NO_SHOW" } }),
      ])

      const stats = {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
        attendanceRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      }

      res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}
