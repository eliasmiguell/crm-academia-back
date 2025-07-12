"use client"

import { Calendar, CreditCard, Dumbbell, Home, TrendingUp, Users, Bell, Activity } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Alunos",
    icon: Users,
    id: "students",
  },
  {
    title: "Pagamentos",
    icon: CreditCard,
    id: "payments",
  },
  {
    title: "Agendamentos",
    icon: Calendar,
    id: "schedule",
  },
  {
    title: "Evolução",
    icon: TrendingUp,
    id: "progress",
  },
  {
    title: "Planos de Treino",
    icon: Dumbbell,
    id: "workout-plans",
  },
  {
    title: "Notificações",
    icon: Bell,
    id: "notifications",
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">GymCRM</h1>
            <p className="text-sm text-muted-foreground">Academia & Personal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
