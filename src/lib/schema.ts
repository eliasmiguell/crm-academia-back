import { z } from "zod"

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["ADMIN", "MANAGER", "INSTRUCTOR"]).optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
})

// Student schemas
export const createStudentSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  phone: z.string().optional().transform(val => val === "" ? undefined : val),
  dateOfBirth: z.string().optional().transform(val => val === "" ? undefined : val),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  address: z.string().optional().transform(val => val === "" ? undefined : val),
  emergencyContact: z.string().optional().transform(val => val === "" ? undefined : val),
  emergencyPhone: z.string().optional().transform(val => val === "" ? undefined : val),
  medicalRestrictions: z.string().optional().transform(val => val === "" ? undefined : val),
  objectives: z.string().optional().transform(val => val === "" ? undefined : val),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// Payment schemas
export const createPaymentSchema = z.object({
  studentId: z.string().min(1, "ID do aluno inválido"),
  amount: z.number().positive("O valor deve ser positivo"),
  dueDate: z.string(),
  description: z.string().optional(),
  type: z.enum(["MONTHLY", "ANNUAL", "REGISTRATION", "OTHER"]),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo").optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  description: z.string().optional(),
})

// Appointment schemas
export const createAppointmentSchema = z.object({
  studentId: z.string().min(1, "ID do aluno inválido"),
  instructorId: z.string().min(1, "ID do instrutor inválido"),
  title: z.string().min(1, "O título é obrigatório"),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(["PERSONAL_TRAINING", "GROUP_CLASS", "EVALUATION", "CONSULTATION"]),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(["PERSONAL_TRAINING", "GROUP_CLASS", "EVALUATION", "CONSULTATION"]).optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  notes: z.string().optional(),
})

// Progress schemas
export const createProgressSchema = z.object({
  studentId: z.string().min(1, "ID do aluno inválido"),
  weight: z.number().positive("O peso deve ser um número positivo").optional(),
  bodyFat: z.number().min(0, "A gordura corporal não pode ser negativa").max(100, "A gordura corporal deve ser no máximo 100%").optional(),
  muscleMass: z.number().positive("A massa muscular deve ser um número positivo").optional(),
  chest: z.number().positive("A medida do peitoral deve ser um número positivo").optional(),
  waist: z.number().positive("A medida da cintura deve ser um número positivo").optional(),
  hip: z.number().positive("A medida do quadril deve ser um número positivo").optional(),
  thigh: z.number().positive("A medida da coxa deve ser um número positivo").optional(),
  arm: z.number().positive("A medida do braço deve ser um número positivo").optional(),
  photos: z.array(z.string()).max(10, "Máximo de 10 fotos permitidas").optional(),
  notes: z.string().optional(),
})

// Workout Plan schemas
export const createWorkoutPlanSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
  studentId: z.string().min(1, "ID do aluno inválido"),
  instructorId: z.string().min(1, "ID do instrutor inválido"),
  exercises: z.array(
    z.object({
      name: z.string().min(1, "O nome do exercício é obrigatório"),
      sets: z.number().positive("O número de séries deve ser positivo"),
      reps: z.string(),
      weight: z.string().optional(),
      restTime: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
})

// Notification schemas
export const createNotificationSchema = z.object({
  userId: z.string().min(1, "ID do usuário inválido"),
  type: z.enum(["PAYMENT_DUE", "PAYMENT_OVERDUE", "APPOINTMENT_REMINDER", "BIRTHDAY", "PLAN_EXPIRING", "GENERAL"]),
  title: z.string().min(1, "O título é obrigatório"),
  message: z.string().min(1, "A mensagem é obrigatória"),
  studentId: z.string().min(1, "ID do aluno inválido").optional(),
})
