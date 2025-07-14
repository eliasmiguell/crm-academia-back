"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
class AuthController {
    static async register(req, res, next) {
        try {
            const validatedData = schema_1.registerSchema.parse(req.body);
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: validatedData.email },
            });
            if (existingUser) {
                return res.status(409).json({ error: "User already exists" });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
            // Create user
            const user = await prisma_1.prisma.user.create({
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
            });
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.status(201).json({
                message: "User created successfully",
                user,
                token,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validatedData = schema_1.loginSchema.parse(req.body);
            // Find user
            const user = await prisma_1.prisma.user.findUnique({
                where: { email: validatedData.email },
            });
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Check password
            const isValidPassword = await bcryptjs_1.default.compare(validatedData.password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verify(req, res, next) {
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
            if (!token) {
                return res.status(401).json({ error: "Access token required" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
            if (!user) {
                return res.status(401).json({ error: "Invalid token" });
            }
            res.json({ user });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
