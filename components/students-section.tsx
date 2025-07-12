"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Eye } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  objectives: string
  medicalRestrictions: string
}

export function StudentsSection() {
  const [students] = useState<Student[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      plan: "Premium",
      status: "active",
      joinDate: "2024-01-15",
      objectives: "Perda de peso e tonificação",
      medicalRestrictions: "Problema no joelho direito",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      plan: "Básico",
      status: "active",
      joinDate: "2024-02-20",
      objectives: "Ganho de massa muscular",
      medicalRestrictions: "Nenhuma",
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777",
      plan: "Premium",
      status: "pending",
      joinDate: "2024-03-10",
      objectives: "Condicionamento físico",
      medicalRestrictions: "Hipertensão",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "",
    objectives: "",
    medicalRestrictions: "",
  })

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "inactive":
        return "Inativo"
      case "pending":
        return "Pendente"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">Gerencie o cadastro dos seus alunos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              <DialogDescription>Preencha as informações do aluno para criar o cadastro</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select
                    value={newStudent.plan}
                    onValueChange={(value) => setNewStudent({ ...newStudent, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectives">Objetivos</Label>
                <Textarea
                  id="objectives"
                  value={newStudent.objectives}
                  onChange={(e) => setNewStudent({ ...newStudent, objectives: e.target.value })}
                  placeholder="Descreva os objetivos do aluno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restrictions">Restrições Médicas</Label>
                <Textarea
                  id="restrictions"
                  value={newStudent.medicalRestrictions}
                  onChange={(e) => setNewStudent({ ...newStudent, medicalRestrictions: e.target.value })}
                  placeholder="Informe restrições médicas ou digite 'Nenhuma'"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Cadastrar Aluno</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">{student.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={getStatusColor(student.status)}>{getStatusText(student.status)}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Plano: {student.plan}</p>
                    <p className="text-sm text-muted-foreground">
                      Desde: {new Date(student.joinDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
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
