"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface Payment {
  id: string
  studentName: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
  plan: string
  method?: string
}

export function PaymentsSection() {
  const [payments] = useState<Payment[]>([
    {
      id: "1",
      studentName: "Maria Silva",
      amount: 120,
      dueDate: "2024-01-15",
      paidDate: "2024-01-14",
      status: "paid",
      plan: "Premium",
      method: "Cartão de Crédito",
    },
    {
      id: "2",
      studentName: "João Santos",
      amount: 80,
      dueDate: "2024-01-20",
      status: "pending",
      plan: "Básico",
    },
    {
      id: "3",
      studentName: "Ana Costa",
      amount: 120,
      dueDate: "2024-01-10",
      status: "overdue",
      plan: "Premium",
    },
    {
      id: "4",
      studentName: "Pedro Lima",
      amount: 150,
      dueDate: "2024-01-25",
      paidDate: "2024-01-25",
      status: "paid",
      plan: "VIP",
      method: "PIX",
    },
  ])

  const [filterStatus, setFilterStatus] = useState("all")

  const filteredPayments = payments.filter((payment) => filterStatus === "all" || payment.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "outline"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "overdue":
        return "Vencido"
      default:
        return status
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  const overdueAmount = payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Controle de mensalidades e pagamentos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {pendingAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {overdueAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar por aluno..." className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{payment.studentName}</h3>
                    <p className="text-sm text-muted-foreground">Plano: {payment.plan}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {payment.paidDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">
                          Pago em: {new Date(payment.paidDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                    {payment.method && <p className="text-sm text-muted-foreground">Método: {payment.method}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      R$ {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(payment.status)}
                      <Badge variant={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {payment.status === "pending" && <Button size="sm">Registrar Pagamento</Button>}
                    {payment.status === "overdue" && (
                      <Button size="sm" variant="destructive">
                        Cobrar
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
