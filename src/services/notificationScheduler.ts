import * as cron from 'node-cron'
import { prisma } from '../lib/prisma'
import { NotificationType } from '@prisma/client'

export class NotificationScheduler {
  private static instance: NotificationScheduler
  private jobs: Map<string, cron.ScheduledTask> = new Map()

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler()
    }
    return NotificationScheduler.instance
  }

  // Executar diariamente às 9:00 AM
  start() {
    console.log('Iniciando scheduler de notificações...')
    
    // Job diário para verificar pagamentos em atraso
    const overduePaymentsJob = cron.schedule('0 9 * * *', async () => {
      console.log(' Executando verificação de pagamentos em atraso...')
      await this.checkOverduePayments()
    }, {
      timezone: 'America/Sao_Paulo'
    })

    // Job diário para verificar pagamentos próximos do vencimento
    const duePaymentsJob = cron.schedule('0 9 * * *', async () => {
      console.log(' Executando verificação de pagamentos próximos do vencimento...')
      await this.checkDuePayments()
    }, {
      timezone: 'America/Sao_Paulo'
    })

    // Job diário para verificar aniversários
    const birthdayJob = cron.schedule('0 9 * * *', async () => {
      console.log(' Executando verificação de aniversários...')
      await this.checkBirthdays()
    }, {
      timezone: 'America/Sao_Paulo'
    })

    // Job para executar a cada 6 horas - verificações mais frequentes
    const frequentChecksJob = cron.schedule('0 */6 * * *', async () => {
      console.log(' Executando verificações frequentes...')
      await this.checkOverduePayments()
    }, {
      timezone: 'America/Sao_Paulo'
    })

    this.jobs.set('overduePayments', overduePaymentsJob)
    this.jobs.set('duePayments', duePaymentsJob)
    this.jobs.set('birthday', birthdayJob)
    this.jobs.set('frequentChecks', frequentChecksJob)

    console.log(' Scheduler de notificações iniciado com sucesso!')
    console.log('📅Jobs configurados:')
    console.log('  - Pagamentos em atraso: diário às 9:00 AM')
    console.log('  - Pagamentos próximos do vencimento: diário às 9:00 AM')
    console.log('  - Aniversários: diário às 9:00 AM')
    console.log('  - Verificações frequentes: a cada 6 horas')

    // Executar uma vez na inicialização para testes
    if (process.env.NODE_ENV === 'development') {
      console.log(' Modo desenvolvimento - executando verificações iniciais...')
      setTimeout(() => {
        this.checkOverduePayments()
        this.checkDuePayments()
        this.checkBirthdays()
      }, 5000) // Aguardar 5 segundos para dar tempo do servidor iniciar
    }
  }

  stop() {
    console.log(' Parando scheduler de notificações...')
    this.jobs.forEach((job, name) => {
      job.destroy()
      console.log(`  - Stopped job: ${name}`)
    })
    this.jobs.clear()
    console.log(' Scheduler de notificações parado!')
  }

  // Verificar pagamentos em atraso
  private async checkOverduePayments() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const overduePayments = await prisma.payment.findMany({
        where: {
          OR: [
            { status: "OVERDUE" },
            {
              status: "PENDING",
              dueDate: {
                lt: today
              }
            }
          ]
        },
        include: {
          student: {
            include: {
              instructor: true
            }
          }
        },
      })

      // Atualizar status dos pagamentos pendentes que estão em atraso
      const pendingOverduePayments = overduePayments.filter(p => p.status === "PENDING" && p.dueDate < today)
      if (pendingOverduePayments.length > 0) {
        await prisma.payment.updateMany({
          where: {
            id: {
              in: pendingOverduePayments.map(p => p.id)
            }
          },
          data: {
            status: "OVERDUE"
          }
        })
      }

      // Criar notificações para cada instrutor
      const instructorNotifications = new Map<string, typeof overduePayments>()
      
      overduePayments.forEach(payment => {
        const instructorId = payment.student.instructorId
        if (!instructorNotifications.has(instructorId)) {
          instructorNotifications.set(instructorId, [])
        }
        instructorNotifications.get(instructorId)!.push(payment)
      })

      let totalNotifications = 0
      for (const [instructorId, payments] of instructorNotifications) {
        for (const payment of payments) {
          // Verificar se já existe uma notificação para este pagamento
          const existingNotification = await prisma.notification.findFirst({
            where: {
              type: NotificationType.PAYMENT_OVERDUE,
              studentId: payment.studentId,
              userId: instructorId,
              createdAt: {
                gte: today
              }
            }
          })

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                type: NotificationType.PAYMENT_OVERDUE,
                title: "Pagamento em Atraso",
                message: `O pagamento de ${payment.student.name} no valor de R$ ${payment.amount} está em atraso desde ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                userId: instructorId,
                studentId: payment.studentId,
                isRead: false,
              },
            })
            totalNotifications++
          }
        }
      }

      console.log(`Verificação de pagamentos em atraso concluída: ${totalNotifications} notificações criadas`)
    } catch (error) {
      console.error(' Erro ao verificar pagamentos em atraso:', error)
    }
  }

  // Verificar pagamentos próximos do vencimento
  private async checkDuePayments() {
    try {
      const today = new Date()
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      
      const duePayments = await prisma.payment.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            gte: today,
            lte: threeDaysFromNow
          }
        },
        include: {
          student: {
            include: {
              instructor: true
            }
          }
        },
      })

      // Criar notificações para cada instrutor
      const instructorNotifications = new Map<string, typeof duePayments>()
      
      duePayments.forEach(payment => {
        const instructorId = payment.student.instructorId
        if (!instructorNotifications.has(instructorId)) {
          instructorNotifications.set(instructorId, [])
        }
        instructorNotifications.get(instructorId)!.push(payment)
      })

      let totalNotifications = 0
      for (const [instructorId, payments] of instructorNotifications) {
        for (const payment of payments) {
          // Verificar se já existe uma notificação para este pagamento
          const existingNotification = await prisma.notification.findFirst({
            where: {
              type: NotificationType.PAYMENT_DUE,
              studentId: payment.studentId,
              userId: instructorId,
              createdAt: {
                gte: today
              }
            }
          })

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                type: NotificationType.PAYMENT_DUE,
                title: "Pagamento Próximo do Vencimento",
                message: `O pagamento de ${payment.student.name} no valor de R$ ${payment.amount} vence em ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                userId: instructorId,
                studentId: payment.studentId,
                isRead: false,
              },
            })
            totalNotifications++
          }
        }
      }

      console.log(` Verificação de pagamentos próximos do vencimento concluída: ${totalNotifications} notificações criadas`)
    } catch (error) {
      console.error('Erro ao verificar pagamentos próximos do vencimento:', error)
    }
  }

  // Verificar aniversários
  private async checkBirthdays() {
    try {
      const today = new Date()
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()

      const allStudents = await prisma.student.findMany({
        where: {
          dateOfBirth: {
            not: null,
          },
        },
        include: {
          instructor: true
        }
      })

      const todayBirthdays = allStudents.filter((student) => {
        if (!student.dateOfBirth) return false
        const birthDate = new Date(student.dateOfBirth)
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay
      })

      // Criar notificações para cada instrutor
      const instructorNotifications = new Map<string, typeof todayBirthdays>()
      
      todayBirthdays.forEach(student => {
        const instructorId = student.instructorId
        if (!instructorNotifications.has(instructorId)) {
          instructorNotifications.set(instructorId, [])
        }
        instructorNotifications.get(instructorId)!.push(student)
      })

      let totalNotifications = 0
      for (const [instructorId, students] of instructorNotifications) {
        for (const student of students) {
          // Verificar se já existe uma notificação para este aniversário
          const existingNotification = await prisma.notification.findFirst({
            where: {
              type: NotificationType.BIRTHDAY,
              studentId: student.id,
              userId: instructorId,
              createdAt: {
                gte: today
              }
            }
          })

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                type: NotificationType.BIRTHDAY,
                title: "Aniversário",
                message: `Hoje é aniversário de ${student.name}! 🎉`,
                userId: instructorId,
                studentId: student.id,
                isRead: false,
              },
            })
            totalNotifications++
          }
        }
      }

      console.log(` Verificação de aniversários concluída: ${totalNotifications} notificações criadas`)
    } catch (error) {
      console.error(' Erro ao verificar aniversários:', error)
    }
  }

  // Método para executar verificações manualmente (para testes)
  async runManualCheck() {
    console.log('🔧 Executando verificação manual...')
    await Promise.all([
      this.checkOverduePayments(),
      this.checkDuePayments(),
      this.checkBirthdays()
    ])
  }
}

export default NotificationScheduler.getInstance() 