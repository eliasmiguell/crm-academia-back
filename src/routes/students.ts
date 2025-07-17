import { Router } from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { StudentController } from "../controllers/studentController"

const router = Router()

// Get all students with pagination and filters
router.get("/", authenticateToken, StudentController.getAll)

// Get student by ID
router.get("/:id", authenticateToken, StudentController.getById)

// Create student - Permitir que instrutores criem alunos
router.post("/", authenticateToken, StudentController.create)

// Update student - Permitir que instrutores editem alunos
router.put("/:id", authenticateToken, StudentController.update)

// Delete student - Apenas ADMIN pode deletar
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), StudentController.delete)

// Get student statistics
router.get("/:id/stats", authenticateToken, StudentController.getStats)

export default router
