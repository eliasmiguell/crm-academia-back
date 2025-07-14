import { Router } from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { UserController } from "../controllers/userController"

const router = Router()

// Get all users (Admin only)
router.get("/", authenticateToken, requireRole(["ADMIN"]), UserController.getAll)

// Get current user profile
router.get("/profile", authenticateToken, UserController.getProfile)

// Update current user profile
router.put("/profile", authenticateToken, UserController.updateProfile)

// Create user (Admin only)
router.post("/", authenticateToken, requireRole(["ADMIN"]), UserController.create)

// Update user (Admin only)
router.put("/:id", authenticateToken, requireRole(["ADMIN"]), UserController.update)

// Delete user (Admin only)
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), UserController.delete)

// Get instructors list
router.get("/instructors", authenticateToken, UserController.getInstructors)

// Get user statistics
router.get("/:id/stats", authenticateToken, UserController.getStats)

export default router
