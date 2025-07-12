import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, AlertCircle, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Dashboard() {
  const stats = [
    {
      title: "Total de Alunos",
      value: "156",
      description: "+12% em relação ao mês passado",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Receita Mensal",
      value: "R$ 18.450",
      description: "+8% em relação ao mês passado",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Aulas Agendadas",
      value: "89",
      description: "Para esta semana",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Frequência Média",
      value: "78%",
      description: "Últimos 30 dias",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentActivities = [
    { student: "Maria Silva", action: "Pagamento realizado", time: "2 horas atrás", type: "payment" },
    { student: "João Santos", action: "Aula agendada", time: "4 horas atrás", type: "schedule" },
    { student: "Ana Costa", action: "Novo cadastro", time: "1 dia atrás", type: "new" },
    { student: "Pedro Lima", action: "Mensalidade vencida", time: "2 dias atrás", type: "overdue" },
  ]

  const upcomingPayments = [
    { student: "Carlos Oliveira", amount: "R$ 120,00", dueDate: "Hoje" },
    { student: "Lucia Ferreira", amount: "R$ 150,00", dueDate: "Amanhã" },
    { student: "Roberto Silva", amount: "R$ 100,00", dueDate: "Em 2 dias" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua academia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades dos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activity.type === "overdue"
                          ? "destructive"
                          : activity.type === "payment"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {activity.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pagamentos Próximos
            </CardTitle>
            <CardDescription>Mensalidades com vencimento próximo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{payment.student}</p>
                    <p className="text-sm text-muted-foreground">{payment.amount}</p>
                  </div>
                  <Badge variant={payment.dueDate === "Hoje" ? "destructive" : "outline"}>{payment.dueDate}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
