import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  

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
  await prisma.user.upsert({
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

  console.log("✅ Database seeded successfully!")
  console.log("📋 Created users:")
  console.log("   - Admin: admin@gymcrm.com / admin123")
  console.log("   - Instructor: instructor@gymcrm.com / instructor123")
  console.log("   - Manager: manager@gymcrm.com / manager123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
