"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationScheduler = void 0;
const cron = __importStar(require("node-cron"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class NotificationScheduler {
    constructor() {
        this.jobs = new Map();
    }
    static getInstance() {
        if (!NotificationScheduler.instance) {
            NotificationScheduler.instance = new NotificationScheduler();
        }
        return NotificationScheduler.instance;
    }
    // Executar diariamente às 9:00 AM
    start() {
        console.log('Iniciando scheduler de notificações...');
        // Job diário para verificar pagamentos em atraso
        const overduePaymentsJob = cron.schedule('0 9 * * *', async () => {
            console.log(' Executando verificação de pagamentos em atraso...');
            await this.checkOverduePayments();
        }, {
            timezone: 'America/Sao_Paulo'
        });
        // Job diário para verificar pagamentos próximos do vencimento
        const duePaymentsJob = cron.schedule('0 9 * * *', async () => {
            console.log(' Executando verificação de pagamentos próximos do vencimento...');
            await this.checkDuePayments();
        }, {
            timezone: 'America/Sao_Paulo'
        });
        // Job diário para verificar aniversários
        const birthdayJob = cron.schedule('0 9 * * *', async () => {
            console.log(' Executando verificação de aniversários...');
            await this.checkBirthdays();
        }, {
            timezone: 'America/Sao_Paulo'
        });
        // Job para executar a cada 6 horas - verificações mais frequentes
        const frequentChecksJob = cron.schedule('0 */6 * * *', async () => {
            console.log(' Executando verificações frequentes...');
            await this.checkOverduePayments();
        }, {
            timezone: 'America/Sao_Paulo'
        });
        this.jobs.set('overduePayments', overduePaymentsJob);
        this.jobs.set('duePayments', duePaymentsJob);
        this.jobs.set('birthday', birthdayJob);
        this.jobs.set('frequentChecks', frequentChecksJob);
        console.log(' Scheduler de notificações iniciado com sucesso!');
        console.log('📅Jobs configurados:');
        console.log('  - Pagamentos em atraso: diário às 9:00 AM');
        console.log('  - Pagamentos próximos do vencimento: diário às 9:00 AM');
        console.log('  - Aniversários: diário às 9:00 AM');
        console.log('  - Verificações frequentes: a cada 6 horas');
        // Executar uma vez na inicialização para testes
        if (process.env.NODE_ENV === 'development') {
            console.log(' Modo desenvolvimento - executando verificações iniciais...');
            setTimeout(() => {
                this.checkOverduePayments();
                this.checkDuePayments();
                this.checkBirthdays();
            }, 5000); // Aguardar 5 segundos para dar tempo do servidor iniciar
        }
    }
    stop() {
        console.log(' Parando scheduler de notificações...');
        this.jobs.forEach((job, name) => {
            job.destroy();
            console.log(`  - Stopped job: ${name}`);
        });
        this.jobs.clear();
        console.log(' Scheduler de notificações parado!');
    }
    // Verificar pagamentos em atraso
    async checkOverduePayments() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const overduePayments = await prisma_1.prisma.payment.findMany({
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
            });
            // Atualizar status dos pagamentos pendentes que estão em atraso
            const pendingOverduePayments = overduePayments.filter(p => p.status === "PENDING" && p.dueDate < today);
            if (pendingOverduePayments.length > 0) {
                await prisma_1.prisma.payment.updateMany({
                    where: {
                        id: {
                            in: pendingOverduePayments.map(p => p.id)
                        }
                    },
                    data: {
                        status: "OVERDUE"
                    }
                });
            }
            // Criar notificações para cada instrutor
            const instructorNotifications = new Map();
            overduePayments.forEach(payment => {
                const instructorId = payment.student.instructorId;
                if (!instructorNotifications.has(instructorId)) {
                    instructorNotifications.set(instructorId, []);
                }
                instructorNotifications.get(instructorId).push(payment);
            });
            let totalNotifications = 0;
            for (const [instructorId, payments] of instructorNotifications) {
                for (const payment of payments) {
                    // Verificar se já existe uma notificação para este pagamento
                    const existingNotification = await prisma_1.prisma.notification.findFirst({
                        where: {
                            type: client_1.NotificationType.PAYMENT_OVERDUE,
                            studentId: payment.studentId,
                            userId: instructorId,
                            createdAt: {
                                gte: today
                            }
                        }
                    });
                    if (!existingNotification) {
                        await prisma_1.prisma.notification.create({
                            data: {
                                type: client_1.NotificationType.PAYMENT_OVERDUE,
                                title: "Pagamento em Atraso",
                                message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} está em atraso desde ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                                userId: instructorId,
                                studentId: payment.studentId,
                                isRead: false,
                            },
                        });
                        totalNotifications++;
                    }
                }
            }
            console.log(`Verificação de pagamentos em atraso concluída: ${totalNotifications} notificações criadas`);
        }
        catch (error) {
            console.error(' Erro ao verificar pagamentos em atraso:', error);
        }
    }
    // Verificar pagamentos próximos do vencimento
    async checkDuePayments() {
        try {
            const today = new Date();
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const duePayments = await prisma_1.prisma.payment.findMany({
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
            });
            // Criar notificações para cada instrutor
            const instructorNotifications = new Map();
            duePayments.forEach(payment => {
                const instructorId = payment.student.instructorId;
                if (!instructorNotifications.has(instructorId)) {
                    instructorNotifications.set(instructorId, []);
                }
                instructorNotifications.get(instructorId).push(payment);
            });
            let totalNotifications = 0;
            for (const [instructorId, payments] of instructorNotifications) {
                for (const payment of payments) {
                    // Verificar se já existe uma notificação para este pagamento
                    const existingNotification = await prisma_1.prisma.notification.findFirst({
                        where: {
                            type: client_1.NotificationType.PAYMENT_DUE,
                            studentId: payment.studentId,
                            userId: instructorId,
                            createdAt: {
                                gte: today
                            }
                        }
                    });
                    if (!existingNotification) {
                        await prisma_1.prisma.notification.create({
                            data: {
                                type: client_1.NotificationType.PAYMENT_DUE,
                                title: "Pagamento Próximo do Vencimento",
                                message: `O pagamento de ${payment.student.name} no valor de R$ ${Number(payment.amount).toFixed(2)} vence em ${payment.dueDate.toLocaleDateString("pt-BR")}`,
                                userId: instructorId,
                                studentId: payment.studentId,
                                isRead: false,
                            },
                        });
                        totalNotifications++;
                    }
                }
            }
            console.log(` Verificação de pagamentos próximos do vencimento concluída: ${totalNotifications} notificações criadas`);
        }
        catch (error) {
            console.error('Erro ao verificar pagamentos próximos do vencimento:', error);
        }
    }
    // Verificar aniversários
    async checkBirthdays() {
        try {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDay = today.getDate();
            const allStudents = await prisma_1.prisma.student.findMany({
                where: {
                    dateOfBirth: {
                        not: null,
                    },
                },
                include: {
                    instructor: true
                }
            });
            const todayBirthdays = allStudents.filter((student) => {
                if (!student.dateOfBirth)
                    return false;
                const birthDate = new Date(student.dateOfBirth);
                return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
            });
            // Criar notificações para cada instrutor
            const instructorNotifications = new Map();
            todayBirthdays.forEach(student => {
                const instructorId = student.instructorId;
                if (!instructorNotifications.has(instructorId)) {
                    instructorNotifications.set(instructorId, []);
                }
                instructorNotifications.get(instructorId).push(student);
            });
            let totalNotifications = 0;
            for (const [instructorId, students] of instructorNotifications) {
                for (const student of students) {
                    // Verificar se já existe uma notificação para este aniversário
                    const existingNotification = await prisma_1.prisma.notification.findFirst({
                        where: {
                            type: client_1.NotificationType.BIRTHDAY,
                            studentId: student.id,
                            userId: instructorId,
                            createdAt: {
                                gte: today
                            }
                        }
                    });
                    if (!existingNotification) {
                        await prisma_1.prisma.notification.create({
                            data: {
                                type: client_1.NotificationType.BIRTHDAY,
                                title: "Aniversário",
                                message: `Hoje é aniversário de ${student.name}! 🎉`,
                                userId: instructorId,
                                studentId: student.id,
                                isRead: false,
                            },
                        });
                        totalNotifications++;
                    }
                }
            }
            console.log(` Verificação de aniversários concluída: ${totalNotifications} notificações criadas`);
        }
        catch (error) {
            console.error(' Erro ao verificar aniversários:', error);
        }
    }
    // Método para executar verificações manualmente (para testes)
    async runManualCheck() {
        console.log('🔧 Executando verificação manual...');
        await Promise.all([
            this.checkOverduePayments(),
            this.checkDuePayments(),
            this.checkBirthdays()
        ]);
    }
}
exports.NotificationScheduler = NotificationScheduler;
exports.default = NotificationScheduler.getInstance();
