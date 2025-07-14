import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { errorHandler } from "./middleware/errorHandler"
// import notificationScheduler from "./services/notificationScheduler"

// Import routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import studentRoutes from "./routes/students"
import paymentRoutes from "./routes/payments"
import appointmentRoutes from "./routes/appointments"
import progressRoutes from "./routes/progress"
import workoutPlanRoutes from "./routes/workoutPlans"
import notificationRoutes from "./routes/notifications"
import dashboardRoutes from "./routes/dashboard"

const app = express()
const PORT = process.env.PORT || 8000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/workout-plans", workoutPlanRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/dashboard", dashboardRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handling middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}`)
  
  // Iniciar scheduler de notificações
  // notificationScheduler.start()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully...')
  // notificationScheduler.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully...')
  // notificationScheduler.stop()
  process.exit(0)
})

export default app
