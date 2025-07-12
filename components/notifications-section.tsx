"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertCircle, Calendar, CreditCard, Users, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "payment" | "appointment" | "birthday" | "renewal" | "system"
  title: string
  message: string
  date: string
  read: boolean
  priority: "high" | "medium" | "low"
  studentName?: string
}

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "payment",
      title: "Mensalidade Vencida",
      message: "A mensalidade de Pedro Lima venceu há 3 dias",
      date: "2024-01-15T10:30:00",
      read: false,
      priority: "high",
      studentName: "Pedro Lima",
    },
    {
      id: "2",
      type: "appointment",
      title: "Aula Cancelada",
      message: "Maria Silva cancelou a aula de hoje às 14:00",
      date: "2024-01-15T08:15:00",
      read: false,
      priority: "medium",
      studentName: "Maria Silva",
    },
    {
      id: "3",
      type: "birthday",
      title: "Aniversário",
      message: "Hoje é aniversário de João Santos!",
      date: "2024-01-15T00:00:00",
      read: true,
      priority: "low",
      studentName: "João Santos",
    },
    {
      id: "4",
      type: "renewal",
      title: "Renovação de Plano",
      message: "O plano de Ana Costa vence em 7 dias",
      date: "2024-01-14T16:45:00",
      read: false,
      priority: "medium",
      studentName: "Ana Costa",
    },
    {
      id: "5",
      type: "system",
      title: "Backup Realizado",
      message: "Backup automático dos dados foi concluído com sucesso",
      date: "2024-01-14T02:00:00",
      read: true,
      priority: "low",
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-red-600" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "birthday":
        return <Users className="h-4 w-4 text-purple-600" />
      case "renewal":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "system":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "outline"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      case "low":
        return "Baixa"
      default:
        return priority
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const highPriorityCount = notifications.filter((n) => n.priority === "high" && !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Central de alertas e lembretes</p>
        </div>
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar Todas como Lidas
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Notificações pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => new Date(n.date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-muted-foreground">Notificações de hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/50" : ""}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${!notification.read ? "text-blue-900" : ""}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(notification.date).toLocaleString("pt-BR")}</span>
                      {notification.studentName && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.studentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(notification.priority)}>
                    {getPriorityText(notification.priority)}
                  </Badge>
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                      Marcar como Lida
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">Você está em dia! Não há notificações pendentes.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
