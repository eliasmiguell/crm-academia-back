import { Router } from "express"
import { authenticateToken } from "../middleware/auth"
import { DashboardController } from "../controllers/dashboardController"

const router = Router()

// Get dashboard overview statistics
router.get("/overview", authenticateToken, DashboardController.getOverview)

// Get recent activities
router.get("/recent-activities", authenticateToken, DashboardController.getRecentActivities)

// Get monthly revenue chart data
router.get("/revenue-chart", authenticateToken, DashboardController.getRevenueChart)

// Get student growth chart data
router.get("/student-growth", authenticateToken, DashboardController.getStudentGrowth)

export default router
