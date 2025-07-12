import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Criar usuário administrador
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@gymcrm.com",
      name: "Administrador",
      password: await hash("admin123", 12),
      role: "ADMIN",
      phone: "(11) 99999-9999",
    },
  })

  // Criar instrutor
  const instructor = await prisma.user.create({
    data: {
      email: "instructor@gymcrm.com",
      name: "João Silva",
      password: await hash("instructor123", 12),
      role: "INSTRUCTOR",
      phone: "(11) 88888-8888",
    },
  })

  // Criar alunos de exemplo
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "(11) 77777-7777",
        dateOfBirth: new Date("1990-05-15"),
        gender: "FEMALE",
        objectives: "Perder peso e ganhar massa muscular",
        medicalRestrictions: "Problema no joelho direito",
        instructorId: instructor.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Carlos Oliveira",
        email: "carlos@email.com",
        phone: "(11) 66666-6666",
        dateOfBirth: new Date("1985-08-22"),
        gender: "MALE",
        objectives: "Ganhar massa muscular",
        instructorId: instructor.id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Ana Costa",
        email: "ana@email.com",
        phone: "(11) 55555-5555",
        dateOfBirth: new Date("1992-12-10"),
        gender: "FEMALE",
        objectives: "Melhorar condicionamento físico",
        instructorId: instructor.id,
      },
    }),
  ])

  // Criar pagamentos
  for (const student of students) {
    await prisma.payment.create({
      data: {
        amount: 150.0,
        dueDate: new Date("2024-01-15"),
        status: "PAID",
        paidDate: new Date("2024-01-10"),
        method: "PIX",
        description: "Mensalidade Janeiro 2024",
        studentId: student.id,
      },
    })

    await prisma.payment.create({
      data: {
        amount: 150.0,
        dueDate: new Date("2024-02-15"),
        status: "PENDING",
        description: "Mensalidade Fevereiro 2024",
        studentId: student.id,
      },
    })
  }

  // Criar agendamentos
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      title: "Treino Personal - Maria",
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1 hora
      type: "PERSONAL_TRAINING",
      status: "SCHEDULED",
      studentId: students[0].id,
      instructorId: instructor.id,
    },
  })

  // Criar plano de treino
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: "Treino de Força - Iniciante",
      description: "Plano focado em ganho de força e massa muscular",
      startDate: new Date(),
      studentId: students[0].id,
      instructorId: instructor.id,
    },
  })

  // Criar exercícios para o plano
  await Promise.all([
    prisma.exercise.create({
      data: {
        name: "Agachamento",
        sets: 3,
        reps: "12-15",
        weight: 40.0,
        restTime: 90,
        instructions: "Manter as costas retas e descer até 90 graus",
        order: 1,
        workoutPlanId: workoutPlan.id,
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Supino Reto",
        sets: 3,
        reps: "10-12",
        weight: 30.0,
        restTime: 120,
        instructions: "Controlar a descida e explodir na subida",
        order: 2,
        workoutPlanId: workoutPlan.id,
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Remada Curvada",
        sets: 3,
        reps: "12-15",
        weight: 25.0,
        restTime: 90,
        instructions: "Manter o core contraído durante todo o movimento",
        order: 3,
        workoutPlanId: workoutPlan.id,
      },
    }),
  ])

  // Criar registros de progresso
  await prisma.progressRecord.create({
    data: {
      weight: 70.5,
      bodyFat: 18.5,
      muscleMass: 32.0,
      chest: 95.0,
      waist: 75.0,
      hip: 98.0,
      thigh: 58.0,
      arm: 32.0,
      notes: "Primeira avaliação física",
      studentId: students[0].id,
    },
  })

  // Criar notificações
  await Promise.all([
    prisma.notification.create({
      data: {
        title: "Pagamento Vencendo",
        message: "A mensalidade de Maria Santos vence em 3 dias",
        type: "PAYMENT_DUE",
        userId: instructor.id,
        studentId: students[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Aniversário",
        message: "Carlos Oliveira faz aniversário hoje!",
        type: "BIRTHDAY",
        userId: instructor.id,
        studentId: students[1].id,
      },
    }),
  ])

  console.log("Seed executado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
