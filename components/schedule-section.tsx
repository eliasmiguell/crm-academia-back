"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Appointment {
  id: string
  studentName: string
  date: string
  time: string
  type: "personal" | "group" | "evaluation"
  status: "scheduled" | "completed" | "cancelled"
  trainer: string
  notes?: string
}

export function ScheduleSection() {
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      studentName: "Maria Silva",
      date: "2024-01-15",
      time: "09:00",
      type: "personal",
      status: "scheduled",
      trainer: "Carlos Personal",
      notes: "Treino de pernas",
    },
    {
      id: "2",
      studentName: "João Santos",
      date: "2024-01-15",
      time: "10:30",
      type: "evaluation",
      status: "completed",
      trainer: "Ana Nutricionista",
    },
    {
      id: "3",
      studentName: "Ana Costa",
      date: "2024-01-16",
      time: "14:00",
      type: "group",
      status: "scheduled",
      trainer: "Pedro Instrutor",
      notes: "Aula de spinning",
    },
    {
      id: "4",
      studentName: "Pedro Lima",
      date: "2024-01-16",
      time: "16:00",
      type: "personal",
      status: "cancelled",
      trainer: "Carlos Personal",
    },
  ])

  const [filterDate, setFilterDate] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const getTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "default"
      case "group":
        return "secondary"
      case "evaluation":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "personal":
        return "Personal"
      case "group":
        return "Grupo"
      case "evaluation":
        return "Avaliação"
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const todayAppointments = appointments.filter((apt) => apt.date === new Date().toISOString().split("T")[0]).length

  const weekAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return aptDate >= today && aptDate <= weekFromNow
  }).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie aulas e treinos agendados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Agendamentos para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekAppointments}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="group">Grupo</SelectItem>
                <SelectItem value="evaluation">Avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{appointment.studentName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{appointment.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Instrutor: {appointment.trainer}</p>
                    {appointment.notes && <p className="text-sm text-muted-foreground">Obs: {appointment.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right space-y-2">
                    <Badge variant={getTypeColor(appointment.type)}>{getTypeText(appointment.type)}</Badge>
                    <div>
                      <Badge variant={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button size="sm">Marcar Presença</Button>
                        <Button variant="outline" size="sm">
                          Reagendar
                        </Button>
                      </>
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
