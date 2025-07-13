import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { NotificationController } from "../controllers/notificationController"

const router = express.Router()

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

// Get notification statistics
router.get("/stats/overview", authenticateToken, NotificationController.getStats)

// Create system notifications (automated)
router.post(
  "/system/payment-overdue",
  authenticateToken,
  requireRole(["ADMIN"]),
  NotificationController.createPaymentOverdueNotifications,
)

// Create birthday notifications
router.post(
  "/system/birthdays",
  authenticateToken,
  requireRole(["ADMIN"]),
  NotificationController.createBirthdayNotifications,
)

export default router
