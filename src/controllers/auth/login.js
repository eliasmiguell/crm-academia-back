"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const schema_1 = require("../../lib/schema");
async function POST(request, response) {
    try {
        const body = request.body;
        // Validar dados de entrada
        const validatedData = schema_1.loginSchema.parse(body);
        // Buscar usuário no banco
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user) {
            return response.status(401).json({ message: "Email ou senha inválidos" });
        }
        // Verificar senha
        const isPasswordValid = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({ message: "Email ou senha inválidos" });
        }
        // Gerar token JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" });
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
        });
    }
    catch (error) {
        console.log("Erro no login:", error);
        if (error instanceof Error && error.name === "ZodError") {
            return response.status(400).json({ message: "Dados inválidos", errors: error });
        }
        return response.status(500).json({ message: "Erro interno do servidor" });
    }
}
