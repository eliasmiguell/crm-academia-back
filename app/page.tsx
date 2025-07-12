"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { StudentsSection } from "@/components/students-section"
import { PaymentsSection } from "@/components/payments-section"
import { ScheduleSection } from "@/components/schedule-section"
import { ProgressSection } from "@/components/progress-section"
import { WorkoutPlansSection } from "@/components/workout-plans-section"
import { NotificationsSection } from "@/components/notifications-section"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "students":
        return <StudentsSection />
      case "payments":
        return <PaymentsSection />
      case "schedule":
        return <ScheduleSection />
      case "progress":
        return <ProgressSection />
      case "workout-plans":
        return <WorkoutPlansSection />
      case "notifications":
        return <NotificationsSection />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6 bg-gray-50">{renderSection()}</main>
      </div>
    </SidebarProvider>
  )
}
