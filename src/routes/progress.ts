import express from "express"
import { ProgressController } from "../controllers/progressController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Get all progress records with pagination and filters
router.get("/", authenticateToken, ProgressController.getAll)

// Get progress record by ID
router.get("/:id", authenticateToken, ProgressController.getById)

// Create progress record
router.post("/", authenticateToken, ProgressController.create)

// Update progress record
router.put("/:id", authenticateToken, ProgressController.update)

// Delete progress record
router.delete("/:id", authenticateToken, ProgressController.delete)

// Get student progress history
router.get("/student/:studentId/history", authenticateToken, ProgressController.getStudentHistory)

export default router

