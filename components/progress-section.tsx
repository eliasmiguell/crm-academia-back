"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Camera, Scale, Ruler } from "lucide-react"

interface ProgressRecord {
  id: string
  studentName: string
  date: string
  weight: number
  bodyFat?: number
  muscleMass?: number
  measurements: {
    chest?: number
    waist?: number
    hip?: number
    arm?: number
    thigh?: number
  }
  photos?: string[]
  notes?: string
}

export function ProgressSection() {
  const [progressRecords] = useState<ProgressRecord[]>([
    {
      id: "1",
      studentName: "Maria Silva",
      date: "2024-01-15",
      weight: 65.5,
      bodyFat: 22.5,
      muscleMass: 45.2,
      measurements: {
        chest: 90,
        waist: 70,
        hip: 95,
        arm: 28,
        thigh: 55,
      },
      notes: "Ótimo progresso na perda de gordura",
    },
    {
      id: "2",
      studentName: "João Santos",
      date: "2024-01-10",
      weight: 78.2,
      bodyFat: 15.8,
      muscleMass: 58.5,
      measurements: {
        chest: 105,
        waist: 85,
        hip: 98,
        arm: 35,
        thigh: 62,
      },
      notes: "Ganho de massa muscular consistente",
    },
    {
      id: "3",
      studentName: "Ana Costa",
      date: "2024-01-08",
      weight: 58.8,
      bodyFat: 18.2,
      muscleMass: 42.1,
      measurements: {
        chest: 85,
        waist: 65,
        hip: 90,
        arm: 25,
        thigh: 50,
      },
      notes: "Melhora no condicionamento físico",
    },
  ])

  const [selectedStudent, setSelectedStudent] = useState("all")

  const filteredRecords = progressRecords.filter(
    (record) => selectedStudent === "all" || record.studentName === selectedStudent,
  )

  const students = Array.from(new Set(progressRecords.map((r) => r.studentName)))

  const getWeightTrend = (currentWeight: number, previousWeight?: number) => {
    if (!previousWeight) return null
    const diff = currentWeight - previousWeight
    return {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
      value: Math.abs(diff).toFixed(1),
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Evolução Física</h1>
          <p className="text-muted-foreground">Acompanhe o progresso dos alunos</p>
        </div>
        <Button>
          <Camera className="h-4 w-4 mr-2" />
          Registrar Evolução
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros Este Mês</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressRecords.length}</div>
            <p className="text-xs text-muted-foreground">Avaliações realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Avaliados</CardTitle>
            <Ruler className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Diferentes alunos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Alunos com evolução positiva</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por aluno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alunos</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student} value={student}>
                    {student}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Records */}
      <div className="grid gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{record.studentName}</CardTitle>
                  <CardDescription>Avaliação de {new Date(record.date).toLocaleDateString("pt-BR")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Ver Fotos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Body Composition */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Composição Corporal
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Peso</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{record.weight} kg</span>
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    {record.bodyFat && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Gordura Corporal</span>
                        <span className="font-semibold">{record.bodyFat}%</span>
                      </div>
                    )}
                    {record.muscleMass && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Massa Muscular</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{record.muscleMass} kg</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Measurements */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Medidas (cm)
                  </h4>
                  <div className="grid gap-3">
                    {record.measurements.chest && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Peitoral</span>
                        <span className="font-semibold">{record.measurements.chest} cm</span>
                      </div>
                    )}
                    {record.measurements.waist && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Cintura</span>
                        <span className="font-semibold">{record.measurements.waist} cm</span>
                      </div>
                    )}
                    {record.measurements.hip && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Quadril</span>
                        <span className="font-semibold">{record.measurements.hip} cm</span>
                      </div>
                    )}
                    {record.measurements.arm && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Braço</span>
                        <span className="font-semibold">{record.measurements.arm} cm</span>
                      </div>
                    )}
                    {record.measurements.thigh && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Coxa</span>
                        <span className="font-semibold">{record.measurements.thigh} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {record.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Observações</h5>
                  <p className="text-blue-800 text-sm">{record.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" size="sm">
                  Comparar Evolução
                </Button>
                <Button variant="outline" size="sm">
                  Editar Registro
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
