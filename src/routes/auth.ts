import { Router } from "express"
import { AuthController } from "../controllers/authController"

const router = Router()

// Register
router.post("/register", AuthController.register)

// Login
router.post("/login", AuthController.login)

// Verify token
router.get("/verify", AuthController.verify)

export default router
