# 🏋️‍♂️ Gym CRM Backend

Backend API completo para sistema de CRM de academias e personal trainers.

## 🚀 Tecnologias

- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** para autenticação
- **Zod** para validação
- **bcryptjs** para hash de senhas

## 📋 Funcionalidades

### 🔐 Autenticação
- Login/Registro com JWT
- Middleware de autenticação
- Sistema de permissões (Admin, Manager, Instructor)

### 👥 Gestão de Alunos
- CRUD completo de alunos
- Filtros e paginação
- Histórico de progresso
- Planos (Basic, Premium, VIP)

### 💰 Controle Financeiro
- Gestão de pagamentos
- Status (Pendente, Pago, Atrasado)
- Relatórios financeiros
- Notificações de atraso

### 📅 Agendamentos
- Sistema de agendamentos
- Verificação de conflitos
- Tipos de consulta
- Controle de disponibilidade

### 📊 Progresso dos Alunos
- Registros de evolução
- Medidas corporais
- Gráficos de tendência
- Histórico completo

### 🏃‍♂️ Planos de Treino
- Criação de treinos personalizados
- Exercícios detalhados
- Cópia de planos
- Ativação/Desativação

### 🔔 Notificações
- Sistema de notificações
- Prioridades (Alta, Média, Baixa)
- Notificações automáticas
- Marcação de leitura

### 📈 Dashboard
- Estatísticas gerais
- Gráficos de receita
- Crescimento de alunos
- Atividades recentes

## 🛠️ Instalação

\`\`\`bash
# Clone o repositório
git clone <repository-url>
cd gym-crm-backend

# Instale as dependências
npm install

# Configure o banco de dados
cp .env.example .env
# Edite o .env com suas configurações

# Execute as migrations
npm run db:push

# Popule o banco com dados de exemplo
npm run db:seed

# Inicie o servidor
npm run dev
\`\`\`

## 🔧 Configuração

### Variáveis de Ambiente

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/gym_crm"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
\`\`\`

### Scripts Disponíveis

\`\`\`bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar mudanças no schema
npm run db:seed      # Popular banco com dados de exemplo
npm run db:studio    # Abrir Prisma Studio
npm run lint         # Executar ESLint
npm run lint:fix     # Corrigir problemas do ESLint
\`\`\`

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Usuários
- `GET /api/users` - Listar usuários (Admin)
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/instructors` - Listar instrutores

### Alunos
- `GET /api/students` - Listar alunos
- `GET /api/students/:id` - Buscar aluno
- `POST /api/students` - Criar aluno
- `PUT /api/students/:id` - Atualizar aluno
- `DELETE /api/students/:id` - Deletar aluno
- `GET /api/students/:id/stats` - Estatísticas do aluno

### Pagamentos
- `GET /api/payments` - Listar pagamentos
- `GET /api/payments/:id` - Buscar pagamento
- `POST /api/payments` - Criar pagamento
- `PUT /api/payments/:id` - Atualizar pagamento
- `DELETE /api/payments/:id` - Deletar pagamento
- `GET /api/payments/stats/overview` - Estatísticas financeiras
- `POST /api/payments/mark-overdue` - Marcar pagamentos atrasados

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Buscar agendamento
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Deletar agendamento
- `GET /api/appointments/availability/:instructorId` - Disponibilidade
- `GET /api/appointments/stats/overview` - Estatísticas

### Progresso
- `GET /api/progress` - Listar registros
- `GET /api/progress/:id` - Buscar registro
- `POST /api/progress` - Criar registro
- `PUT /api/progress/:id` - Atualizar registro
- `DELETE /api/progress/:id` - Deletar registro
- `GET /api/progress/student/:studentId/history` - Histórico do aluno

### Planos de Treino
- `GET /api/workout-plans` - Listar planos
- `GET /api/workout-plans/:id` - Buscar plano
- `POST /api/workout-plans` - Criar plano
- `PUT /api/workout-plans/:id` - Atualizar plano
- `DELETE /api/workout-plans/:id` - Deletar plano
- `PATCH /api/workout-plans/:id/toggle-active` - Ativar/Desativar
- `POST /api/workout-plans/:id/copy` - Copiar plano

### Notificações
- `GET /api/notifications` - Listar notificações
- `GET /api/notifications/:id` - Buscar notificação
- `POST /api/notifications` - Criar notificação
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `PATCH /api/notifications/read-all` - Marcar todas como lidas
- `DELETE /api/notifications/:id` - Deletar notificação
- `GET /api/notifications/stats/overview` - Estatísticas

### Dashboard
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/recent-activities` - Atividades recentes
- `GET /api/dashboard/revenue-chart` - Gráfico de receita
- `GET /api/dashboard/student-growth` - Crescimento de alunos

## 🔒 Autenticação

Todas as rotas (exceto auth) requerem token JWT no header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## 👥 Permissões

- **ADMIN**: Acesso total
- **MANAGER**: Gestão de alunos e pagamentos
- **INSTRUCTOR**: Visualização e treinos

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM. O schema inclui:

- Users (Usuários)
- Students (Alunos)
- Payments (Pagamentos)
- Appointments (Agendamentos)
- ProgressRecords (Registros de Progresso)
- WorkoutPlans (Planos de Treino)
- Exercises (Exercícios)
- Notifications (Notificações)

## 🧪 Dados de Teste

Após executar `npm run db:seed`:

- **Admin**: admin@gymcrm.com / admin123
- **Instructor**: instructor@gymcrm.com / instructor123

## 🚀 Deploy

O backend está pronto para deploy em plataformas como:

- Vercel
- Railway
- Heroku
- DigitalOcean

## 📝 Licença

MIT License
