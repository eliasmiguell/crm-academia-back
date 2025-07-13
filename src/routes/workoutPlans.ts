import { Router } from "express"
import { WorkoutPlanController } from "../controllers/workoutPlanController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

// Get all workout plans with pagination and filters
router.get("/", authenticateToken, WorkoutPlanController.getAll)

// Get workout plan by ID
router.get("/:id", authenticateToken, WorkoutPlanController.getById)

// Create workout plan
router.post("/", authenticateToken, WorkoutPlanController.create)

// Update workout plan
router.put("/:id", authenticateToken, WorkoutPlanController.update)

// Toggle workout plan active status
router.patch("/:id/toggle-active", authenticateToken, WorkoutPlanController.toggleActive)

// Delete workout plan
router.delete("/:id", authenticateToken, requireRole(["ADMIN", "MANAGER"]), WorkoutPlanController.delete)

// Copy workout plan
router.post("/:id/copy", authenticateToken, WorkoutPlanController.copy)

export default router
