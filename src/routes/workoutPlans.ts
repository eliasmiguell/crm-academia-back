import { Router } from "express"
import { WorkoutPlanController } from "../controllers/workoutPlanController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Get all workout plans
router.get("/", authenticateToken, WorkoutPlanController.getAll)

// Get workout plan by id
router.get("/:id", authenticateToken, WorkoutPlanController.getById)

// Create workout plan
router.post("/", authenticateToken, WorkoutPlanController.create)

// Update workout plan
router.patch("/:id", authenticateToken, WorkoutPlanController.update)

// Delete workout plan
router.delete("/:id", authenticateToken, WorkoutPlanController.delete)

// Toggle workout plan active status
router.patch("/:id/toggle-active", authenticateToken, WorkoutPlanController.toggleActive)

// Copy workout plan
router.post("/:id/copy", authenticateToken, WorkoutPlanController.copy)

export default router
