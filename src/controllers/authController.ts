import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { loginSchema, registerSchema } from "../lib/schema"

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body)

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return res.status(409).json({ error: "User already exists" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      // Create user
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
          avatar: true,
        },
      })

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" })

      res.status(201).json({
        message: "User created successfully",
        user,
        token,
      })
    } catch (error) {
      next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body)

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" })

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      })
    } catch (error) {
      next(error)
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"]
      const token = authHeader && authHeader.split(" ")[1]

      if (!token) {
        return res.status(401).json({ error: "Access token required" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      })

      if (!user) {
        return res.status(401).json({ error: "Invalid token" })
      }

      res.json({ user })
    } catch (error) {
      next(error)
    }
  }
}
