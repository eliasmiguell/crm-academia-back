import express from "express"
import { PaymentController } from "../controllers/paymentController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = express.Router()

// Get all payments with pagination and filters
router.get("/", authenticateToken, PaymentController.getAll)

// Get payment by ID
router.get("/:id", authenticateToken, PaymentController.getById)

// Create payment
router.post("/", authenticateToken, PaymentController.create)

// Update payment
router.put("/:id", authenticateToken, requireRole(["ADMIN", "MANAGER"]), PaymentController.update)
router.patch("/:id", authenticateToken, requireRole(["ADMIN", "MANAGER"]), PaymentController.update)

// Delete payment
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), PaymentController.delete)

// Get payment statistics
router.get("/stats/overview", authenticateToken, PaymentController.getStats)

// Mark overdue payments
router.post("/mark-overdue", authenticateToken, requireRole(["ADMIN", "MANAGER"]), PaymentController.markOverdue)

export default router

