import { Router } from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { StudentController } from "../controllers/studentController"

const router = Router()

// Get all students with pagination and filters
router.get("/", authenticateToken, StudentController.getAll)

// Get student by ID
router.get("/:id", authenticateToken, StudentController.getById)

// Create student
router.post("/", authenticateToken, requireRole(["ADMIN", "MANAGER"]), StudentController.create)

// Update student
router.put("/:id", authenticateToken, requireRole(["ADMIN", "MANAGER"]), StudentController.update)

// Delete student
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), StudentController.delete)

// Get student statistics
router.get("/:id/stats", authenticateToken, StudentController.getStats)

export default router
