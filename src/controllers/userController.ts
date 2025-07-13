import type { Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma"
import type { AuthRequest } from "../middleware/auth"
import { registerSchema } from "../lib/schema"
import { Prisma, UserRole } from "@prisma/client"

export class UserController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const role = req.query.role as UserRole

      const skip = (page - 1) * limit

      const where: Prisma.UserWhereInput = {}

      if (role) {
        where.role = role
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ])

      res.json({
        users,
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

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, currentPassword, newPassword } = req.body

      const updateData: Prisma.UserUpdateInput = {}

      if (name) updateData.name = name
      if (email) updateData.email = email

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password is required to change password" })
        }

        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
        })

        if (!user) {
          return res.status(404).json({ error: "User not found" })
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password)

        if (!isValidPassword) {
          return res.status(400).json({ error: "Current password is incorrect" })
        }

        updateData.password = await bcrypt.hash(newPassword, 12)
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      })

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body)

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return res.status(409).json({ error: "User already exists" })
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      const user = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
          role: validatedData.role || "INSTRUCTOR",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      res.status(201).json({
        message: "User created successfully",
        user,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, role, password } = req.body

      const updateData: Prisma.UserUpdateInput = {}

      if (name) updateData.name = name
      if (email) updateData.email = email
      if (role) updateData.role = role
      if (password) updateData.password = await bcrypt.hash(password, 12)

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      })

      res.json({
        message: "User updated successfully",
        user,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.params.id === req.user!.id) {
        return res.status(400).json({ error: "Cannot delete your own account" })
      }

      await prisma.user.delete({
        where: { id: req.params.id },
      })

      res.json({ message: "User deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  static async getInstructors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const instructors = await prisma.user.findMany({
        where: {
          role: {
            in: ["INSTRUCTOR", "ADMIN", "MANAGER"],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      })

      res.json(instructors)
    } catch (error) {
      next(error)
    }
  }
}
