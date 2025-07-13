import { z } from "zod"

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "INSTRUCTOR"]).optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

// Student schemas
export const createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalRestrictions: z.string().optional(),
  objectives: z.string().optional(),
  plan: z.enum(["BASIC", "PREMIUM", "VIP"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// Payment schemas
export const createPaymentSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string(),
  description: z.string().optional(),
  type: z.enum(["MONTHLY", "ANNUAL", "REGISTRATION", "OTHER"]),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  description: z.string().optional(),
})

// Appointment schemas
export const createAppointmentSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  instructorId: z.string().uuid("Invalid instructor ID"),
  date: z.string(),
  duration: z.number().positive("Duration must be positive"),
  type: z.enum(["PERSONAL_TRAINING", "ASSESSMENT", "CONSULTATION"]),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  duration: z.number().positive().optional(),
  type: z.enum(["PERSONAL_TRAINING", "ASSESSMENT", "CONSULTATION"]).optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  notes: z.string().optional(),
})

// Progress schemas
export const createProgressSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  measurements: z.record(z.number()).optional(),
  notes: z.string().optional(),
})

// Workout Plan schemas
export const createWorkoutPlanSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  studentId: z.string().uuid("Invalid student ID"),
  instructorId: z.string().uuid("Invalid instructor ID"),
  exercises: z.array(
    z.object({
      name: z.string().min(1, "Exercise name is required"),
      sets: z.number().positive("Sets must be positive"),
      reps: z.string(),
      weight: z.string().optional(),
      restTime: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
})

// Notification schemas
export const createNotificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  type: z.enum(["PAYMENT", "APPOINTMENT", "BIRTHDAY", "SYSTEM"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  studentId: z.string().uuid().optional(),
})
