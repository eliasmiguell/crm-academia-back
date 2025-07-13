import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { NotificationController } from "../controllers/notificationController"
import notificationScheduler from "../services/notificationScheduler"

const router = express.Router()

// Get notification statistics (deve vir antes das rotas com parâmetros)
router.get("/stats", authenticateToken, NotificationController.getStats)

// Get all notifications with pagination and filters
router.get("/", authenticateToken, NotificationController.getAll)

// Get notification by ID
router.get("/:id", authenticateToken, NotificationController.getById)

// Create notification
router.post("/", authenticateToken, requireRole(["ADMIN", "MANAGER"]), NotificationController.create)

// Mark notification as read
router.patch("/:id/read", authenticateToken, NotificationController.markAsRead)

// Mark all notifications as read
router.patch("/read-all", authenticateToken, NotificationController.markAllAsRead)

// Delete notification
router.delete("/:id", authenticateToken, NotificationController.delete)

// Create payment overdue notifications
router.post(
  "/payment-overdue",
  authenticateToken,
  requireRole(["ADMIN", "MANAGER"]),
  NotificationController.createPaymentOverdueNotifications,
)

// Create birthday notifications
router.post(
  "/birthday",
  authenticateToken,
  requireRole(["ADMIN", "MANAGER"]),
  NotificationController.createBirthdayNotifications,
)

// Create payment due notifications
router.post(
  "/payment-due",
  authenticateToken,
  requireRole(["ADMIN", "MANAGER"]),
  NotificationController.createPaymentDueNotifications,
)

// Execute manual check (for testing)
router.post(
  "/manual-check",
  authenticateToken,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      await notificationScheduler.runManualCheck()
      res.json({ message: "Manual check executed successfully" })
    } catch (error) {
      console.error("Error executing manual check:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
