import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          error: "Unique constraint violation",
          message: "A record with this data already exists",
        })
      case "P2025":
        return res.status(404).json({
          error: "Record not found",
          message: "The requested record does not exist",
        })
      default:
        return res.status(500).json({
          error: "Database error",
          message: "An error occurred while processing your request",
        })
    }
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is invalid",
    })
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The provided token has expired",
    })
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  })
}
