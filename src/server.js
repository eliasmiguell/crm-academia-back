"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
// import notificationScheduler from "./services/notificationScheduler"
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const students_1 = __importDefault(require("./routes/students"));
const payments_1 = __importDefault(require("./routes/payments"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const progress_1 = __importDefault(require("./routes/progress"));
const workoutPlans_1 = __importDefault(require("./routes/workoutPlans"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API routes
app.use("/api/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/students", students_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/appointments", appointments_1.default);
app.use("/api/progress", progress_1.default);
app.use("/api/workout-plans", workoutPlans_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/dashboard", dashboard_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}`);
    // Iniciar scheduler de notificações
    // notificationScheduler.start()
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(' SIGTERM received, shutting down gracefully...');
    // notificationScheduler.stop()
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log(' SIGINT received, shutting down gracefully...');
    // notificationScheduler.stop()
    process.exit(0);
});
exports.default = app;
