"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Plus, Clock, Target, User } from "lucide-react"

interface Exercise {
  name: string
  sets: number
  reps: string
  weight?: string
  rest: string
  notes?: string
}

interface WorkoutPlan {
  id: string
  name: string
  studentName: string
  trainer: string
  goal: string
  duration: string
  frequency: string
  status: "active" | "completed" | "paused"
  exercises: Exercise[]
  createdDate: string
}

export function WorkoutPlansSection() {
  const [workoutPlans] = useState<WorkoutPlan[]>([
    {
      id: "1",
      name: "Treino de Hipertrofia - Membros Superiores",
      studentName: "João Santos",
      trainer: "Carlos Personal",
      goal: "Ganho de massa muscular",
      duration: "8 semanas",
      frequency: "3x por semana",
      status: "active",
      createdDate: "2024-01-10",
      exercises: [
        {
          name: "Supino Reto",
          sets: 4,
          reps: "8-12",
          weight: "80kg",
          rest: "90s",
          notes: "Controlar a descida",
        },
        {
          name: "Puxada Frontal",
          sets: 4,
          reps: "10-12",
          weight: "70kg",
          rest: "90s",
        },
        {
          name: "Desenvolvimento com Halteres",
          sets: 3,
          reps: "12-15",
          weight: "20kg",
          rest: "60s",
        },
        {
          name: "Rosca Direta",
          sets: 3,
          reps: "12-15",
          weight: "15kg",
          rest: "60s",
        },
      ],
    },
    {
      id: "2",
      name: "Treino Funcional - Emagrecimento",
      studentName: "Maria Silva",
      trainer: "Ana Personal",
      goal: "Perda de peso",
      duration: "12 semanas",
      frequency: "4x por semana",
      status: "active",
      createdDate: "2024-01-05",
      exercises: [
        {
          name: "Burpees",
          sets: 3,
          reps: "15",
          rest: "45s",
          notes: "Manter ritmo constante",
        },
        {
          name: "Agachamento Jump",
          sets: 4,
          reps: "20",
          rest: "30s",
        },
        {
          name: "Mountain Climbers",
          sets: 3,
          reps: "30s",
          rest: "30s",
        },
        {
          name: "Prancha",
          sets: 3,
          reps: "45s",
          rest: "60s",
        },
      ],
    },
    {
      id: "3",
      name: "Treino de Reabilitação - Joelho",
      studentName: "Ana Costa",
      trainer: "Pedro Fisioterapeuta",
      goal: "Reabilitação",
      duration: "6 semanas",
      frequency: "2x por semana",
      status: "paused",
      createdDate: "2024-01-01",
      exercises: [
        {
          name: "Extensão de Joelho",
          sets: 3,
          reps: "15",
          rest: "60s",
          notes: "Movimento controlado",
        },
        {
          name: "Agachamento Parcial",
          sets: 2,
          reps: "10",
          rest: "90s",
        },
      ],
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "paused":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "completed":
        return "Concluído"
      case "paused":
        return "Pausado"
      default:
        return status
    }
  }

  const activePlans = workoutPlans.filter((plan) => plan.status === "active").length
  const totalExercises = workoutPlans.reduce((sum, plan) => sum + plan.exercises.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planos de Treino</h1>
          <p className="text-muted-foreground">Gerencie os treinos dos seus alunos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans}</div>
            <p className="text-xs text-muted-foreground">Treinos em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <p className="text-xs text-muted-foreground">Exercícios cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos com Treino</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutPlans.length}</div>
            <p className="text-xs text-muted-foreground">Alunos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout Plans List */}
      <div className="grid gap-6">
        {workoutPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {plan.studentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {plan.goal}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {plan.duration}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(plan.status)}>{getStatusText(plan.status)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">Instrutor:</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.trainer}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Frequência:</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.frequency}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Criado em:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(plan.createdDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Exercícios:</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.exercises.length}</span>
                  </div>
                </div>

                {/* Exercises Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Exercícios do Treino</h4>
                  <div className="space-y-2">
                    {plan.exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} séries × {exercise.reps} reps
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2">
                        +{plan.exercises.length - 3} exercícios adicionais
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar Plano
                  </Button>
                  {plan.status === "active" && <Button size="sm">Registrar Treino</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
