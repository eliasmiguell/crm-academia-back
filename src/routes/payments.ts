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

// Update payment - Permitir que instrutores atualizem pagamentos
router.put("/:id", authenticateToken, PaymentController.update)
router.patch("/:id", authenticateToken, PaymentController.update)

// Enviar e-mail de cobrança manualmente - Permitir que instrutores enviem
router.patch("/:id/send-charge-email", authenticateToken, PaymentController.sendChargeEmail)

// Delete payment - Apenas ADMIN pode deletar
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), PaymentController.delete)

// Get payment statistics
router.get("/stats/overview", authenticateToken, PaymentController.getStats)

// Mark overdue payments - Permitir que instrutores marquem como vencidos
router.post("/mark-overdue", authenticateToken, PaymentController.markOverdue)

export default router

