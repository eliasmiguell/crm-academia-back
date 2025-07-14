"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = exports.createWorkoutPlanSchema = exports.createProgressSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = exports.updatePaymentSchema = exports.createPaymentSchema = exports.updateStudentSchema = exports.createStudentSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: zod_1.z.string().email("Formato de e-mail inválido"),
    password: zod_1.z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    role: zod_1.z.enum(["ADMIN", "MANAGER", "INSTRUCTOR"]).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Formato de e-mail inválido"),
    password: zod_1.z.string().min(1, "A senha é obrigatória"),
});
// Student schemas
exports.createStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: zod_1.z.string().email("Formato de e-mail inválido"),
    phone: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    dateOfBirth: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(zod_1.z.literal("")).transform(val => val === "" ? undefined : val),
    address: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    emergencyContact: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    emergencyPhone: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    medicalRestrictions: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    objectives: zod_1.z.string().optional().transform(val => val === "" ? undefined : val),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
});
exports.updateStudentSchema = exports.createStudentSchema.partial();
// Payment schemas
exports.createPaymentSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "ID do aluno inválido"),
    amount: zod_1.z.number().positive("O valor deve ser positivo"),
    dueDate: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(["MONTHLY", "ANNUAL", "REGISTRATION", "OTHER"]),
});
exports.updatePaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("O valor deve ser positivo").optional(),
    dueDate: zod_1.z.string().optional(),
    paidAt: zod_1.z.string().optional(),
    status: zod_1.z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
    description: zod_1.z.string().optional(),
    method: zod_1.z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PIX"]).optional(),
});
// Appointment schemas
exports.createAppointmentSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "ID do aluno inválido"),
    instructorId: zod_1.z.string().min(1, "ID do instrutor inválido"),
    title: zod_1.z.string().min(1, "O título é obrigatório"),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    type: zod_1.z.enum(["PERSONAL_TRAINING", "GROUP_CLASS", "EVALUATION", "CONSULTATION"]),
    notes: zod_1.z.string().optional(),
});
exports.updateAppointmentSchema = zod_1.z.object({
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
    type: zod_1.z.enum(["PERSONAL_TRAINING", "GROUP_CLASS", "EVALUATION", "CONSULTATION"]).optional(),
    status: zod_1.z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
    notes: zod_1.z.string().optional(),
});
// Progress schemas
exports.createProgressSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "ID do aluno inválido"),
    weight: zod_1.z.number().positive("O peso deve ser um número positivo").optional(),
    bodyFat: zod_1.z.number().min(0, "A gordura corporal não pode ser negativa").max(100, "A gordura corporal deve ser no máximo 100%").optional(),
    muscleMass: zod_1.z.number().positive("A massa muscular deve ser um número positivo").optional(),
    chest: zod_1.z.number().positive("A medida do peitoral deve ser um número positivo").optional(),
    waist: zod_1.z.number().positive("A medida da cintura deve ser um número positivo").optional(),
    hip: zod_1.z.number().positive("A medida do quadril deve ser um número positivo").optional(),
    thigh: zod_1.z.number().positive("A medida da coxa deve ser um número positivo").optional(),
    arm: zod_1.z.number().positive("A medida do braço deve ser um número positivo").optional(),
    photos: zod_1.z.array(zod_1.z.string()).max(10, "Máximo de 10 fotos permitidas").optional(),
    notes: zod_1.z.string().optional(),
});
// Workout Plan schemas
exports.createWorkoutPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    description: zod_1.z.string().optional(),
    studentId: zod_1.z.string().min(1, "ID do aluno inválido"),
    instructorId: zod_1.z.string().min(1, "ID do instrutor inválido"),
    exercises: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, "O nome do exercício é obrigatório"),
        sets: zod_1.z.number().positive("O número de séries deve ser positivo"),
        reps: zod_1.z.string().min(1, "As repetições são obrigatórias"),
        weight: zod_1.z.string().optional().or(zod_1.z.literal("")).transform(val => val === "" ? undefined : val),
        restTime: zod_1.z.string().optional().or(zod_1.z.literal("")).transform(val => val === "" ? undefined : val),
        notes: zod_1.z.string().optional().or(zod_1.z.literal("")).transform(val => val === "" ? undefined : val),
    })),
});
// Notification schemas
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "ID do usuário inválido"),
    type: zod_1.z.enum(["PAYMENT_DUE", "PAYMENT_OVERDUE", "APPOINTMENT_REMINDER", "BIRTHDAY", "PLAN_EXPIRING", "GENERAL"]),
    title: zod_1.z.string().min(1, "O título é obrigatório"),
    message: zod_1.z.string().min(1, "A mensagem é obrigatória"),
    studentId: zod_1.z.string().min(1, "ID do aluno inválido").optional(),
});
