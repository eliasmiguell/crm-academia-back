import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@gymcrm.com" },
    update: {},
    create: {
      email: "admin@gymcrm.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Create instructor user
  const instructorPassword = await bcrypt.hash("instructor123", 12)
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@gymcrm.com" },
    update: {},
    create: {
      email: "instructor@gymcrm.com",
      name: "João Silva",
      password: instructorPassword,
      role: "INSTRUCTOR",
    },
  })

  // Create manager user
  const managerPassword = await bcrypt.hash("manager123", 12)
  await prisma.user.upsert({
    where: { email: "manager@gymcrm.com" },
    update: {},
    create: {
      email: "manager@gymcrm.com",
      name: "Maria Manager",
      password: managerPassword,
      role: "MANAGER",
    },
  })

  // Create sample students
  const student1 = await prisma.student.upsert({
    where: { email: "aluno1@exemplo.com" },
    update: {},
    create: {
      name: "Carlos Santos",
      email: "aluno1@exemplo.com",
      phone: "(11) 99999-1111",
      dateOfBirth: new Date("1990-05-15"),
      gender: "MALE",
      address: "Rua das Flores, 123",
      emergencyContact: "Ana Santos",
      emergencyPhone: "(11) 99999-2222",
      medicalRestrictions: "Nenhuma",
      objectives: "Ganhar massa muscular",
      status: "ACTIVE",
      instructorId: instructor.id,
    },
  })

  const student2 = await prisma.student.upsert({
    where: { email: "aluna2@exemplo.com" },
    update: {},
    create: {
      name: "Fernanda Lima",
      email: "aluna2@exemplo.com",
      phone: "(11) 99999-3333",
      dateOfBirth: new Date("1985-08-20"),
      gender: "FEMALE",
      address: "Av. Principal, 456",
      emergencyContact: "Pedro Lima",
      emergencyPhone: "(11) 99999-4444",
      medicalRestrictions: "Problema no joelho direito",
      objectives: "Perder peso e definir músculos",
      status: "ACTIVE",
      instructorId: instructor.id,
    },
  })

  const student3 = await prisma.student.upsert({
    where: { email: "aluno3@exemplo.com" },
    update: {},
    create: {
      name: "Ricardo Oliveira",
      email: "aluno3@exemplo.com",
      phone: "(11) 99999-5555",
      dateOfBirth: new Date("1992-12-10"),
      gender: "MALE",
      address: "Rua dos Esportes, 789",
      emergencyContact: "Lucia Oliveira",
      emergencyPhone: "(11) 99999-6666",
      medicalRestrictions: "Nenhuma",
      objectives: "Melhorar condicionamento físico",
      status: "ACTIVE",
      instructorId: instructor.id,
    },
  })

  // Create sample appointments
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  await prisma.appointment.create({
    data: {
      title: "Personal Training - Carlos",
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      type: "PERSONAL_TRAINING",
      status: "SCHEDULED",
      notes: "Foco em treino de pernas",
      studentId: student1.id,
      instructorId: instructor.id,
    },
  })

  await prisma.appointment.create({
    data: {
      title: "Avaliação Física - Fernanda",
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
      type: "EVALUATION",
      status: "SCHEDULED",
      notes: "Primeira avaliação",
      studentId: student2.id,
      instructorId: instructor.id,
    },
  })

  await prisma.appointment.create({
    data: {
      title: "Consulta - Ricardo",
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
      type: "CONSULTATION",
      status: "SCHEDULED",
      notes: "Discussão sobre novo plano de treino",
      studentId: student3.id,
      instructorId: instructor.id,
    },
  })

  // Create sample payments
  const lastMonth = new Date(today)
  lastMonth.setMonth(today.getMonth() - 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  // Payment overdue
  await prisma.payment.create({
    data: {
      amount: 120.00,
      dueDate: yesterday,
      status: "PENDING",
      description: "Mensalidade Janeiro",
      studentId: student1.id,
    },
  })

  // Payment due soon
  await prisma.payment.create({
    data: {
      amount: 150.00,
      dueDate: nextWeek,
      status: "PENDING",
      description: "Mensalidade Fevereiro",
      studentId: student2.id,
    },
  })

  // Payment paid
  await prisma.payment.create({
    data: {
      amount: 100.00,
      dueDate: lastMonth,
      paidDate: lastMonth,
      status: "PAID",
      description: "Mensalidade Dezembro",
      method: "PIX",
      studentId: student3.id,
    },
  })

  // Create sample notifications
  await prisma.notification.create({
    data: {
      type: "GENERAL",
      title: "Bem-vindo ao Sistema",
      message: "Seja bem-vindo ao CRM da Academia! Aqui você pode gerenciar seus alunos, pagamentos e muito mais.",
      userId: instructor.id,
      isRead: false,
    },
  })

  await prisma.notification.create({
    data: {
      type: "PAYMENT_OVERDUE",
      title: "Pagamento em Atraso",
      message: `O pagamento de ${student1.name} no valor de R$ 120,00 está em atraso desde ${yesterday.toLocaleDateString("pt-BR")}`,
      userId: instructor.id,
      studentId: student1.id,
      isRead: false,
    },
  })

  await prisma.notification.create({
    data: {
      type: "BIRTHDAY",
      title: "Aniversário",
      message: `Hoje é aniversário de ${student2.name}! 🎉`,
      userId: instructor.id,
      studentId: student2.id,
      isRead: true,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("📋 Created users:")
  console.log("   - Admin: admin@gymcrm.com / admin123")
  console.log("   - Instructor: instructor@gymcrm.com / instructor123")
  console.log("   - Manager: manager@gymcrm.com / manager123")
  console.log("👥 Created students:")
  console.log("   - Carlos Santos (aluno1@exemplo.com)")
  console.log("   - Fernanda Lima (aluna2@exemplo.com)")
  console.log("   - Ricardo Oliveira (aluno3@exemplo.com)")
  console.log("📅 Created appointments:")
  console.log("   - Personal Training - Carlos (hoje 09:00)")
  console.log("   - Avaliação Física - Fernanda (hoje 14:00)")
  console.log("   - Consulta - Ricardo (amanhã 10:00)")
  console.log("💳 Created payments:")
  console.log("   - Pagamento em atraso - Carlos (R$ 120,00)")
  console.log("   - Pagamento próximo do vencimento - Fernanda (R$ 150,00)")
  console.log("   - Pagamento pago - Ricardo (R$ 100,00)")
  console.log("🔔 Created notifications:")
  console.log("   - Bem-vindo ao Sistema (geral)")
  console.log("   - Pagamento em Atraso - Carlos")
  console.log("   - Aniversário - Fernanda")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
