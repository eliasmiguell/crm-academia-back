import { type Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { loginSchema } from "../../lib/schema"

export async function POST(request: Request, response: Response) {
  try {
    const body = request.body

    // Validar dados de entrada
    const validatedData = loginSchema.parse(body)

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return response.status(401).json({ message: "Email ou senha inválidos" })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

    if (!isPasswordValid) {
      return response.status(401).json({ message: "Email ou senha inválidos" })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Retornar dados do usuário (sem senha)
    return response.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.log("Erro no login:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return response.status(400).json({ message: "Dados inválidos", errors: error })
    }

    return response.status(500).json({ message: "Erro interno do servidor" })
  }
}
