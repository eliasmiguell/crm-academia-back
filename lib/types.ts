import type { Prisma } from "@prisma/client"

// Tipos para incluir relacionamentos
export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    instructor: true
    payments: true
    appointments: true
    progressRecords: true
    workoutPlans: {
      include: {
        exercises: true
      }
    }
  }
}>

export type PaymentWithStudent = Prisma.PaymentGetPayload<{
  include: {
    student: true
  }
}>

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    student: true
    instructor: true
  }
}>

export type WorkoutPlanWithRelations = Prisma.WorkoutPlanGetPayload<{
  include: {
    student: true
    instructor: true
    exercises: true
  }
}>

export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: {
    user: true
    student: true
  }
}>

// Tipos para formulários
export type CreateStudentData = Omit<Prisma.StudentCreateInput, "instructor"> & {
  instructorId: string
}

export type CreatePaymentData = Omit<Prisma.PaymentCreateInput, "student"> & {
  studentId: string
}

export type CreateAppointmentData = Omit<Prisma.AppointmentCreateInput, "student" | "instructor"> & {
  studentId: string
  instructorId: string
}

export type CreateWorkoutPlanData = Omit<Prisma.WorkoutPlanCreateInput, "student" | "instructor"> & {
  studentId: string
  instructorId: string
  exercises: Omit<Prisma.ExerciseCreateInput, "workoutPlan">[]
}
