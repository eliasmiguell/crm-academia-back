import { Router } from "express"
import { AppointmentController } from "../controllers/appointmentController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Get all appointments with pagination and filters
router.get("/", authenticateToken, AppointmentController.getAll)

// Get appointment by ID
router.get("/:id", authenticateToken, AppointmentController.getById)

// Create appointment
router.post("/", authenticateToken, AppointmentController.create)

// Update appointment
router.put("/:id", authenticateToken, AppointmentController.update)

// Delete appointment - Permitir que instrutores deletem seus agendamentos
router.delete("/:id", authenticateToken, AppointmentController.delete)

// Get instructor availability
router.get("/availability/:instructorId", authenticateToken, AppointmentController.getAvailability)

// Get appointment statistics
router.get("/stats/overview", authenticateToken, AppointmentController.getStats)

export default router

