"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notificationController_1 = require("../controllers/notificationController");
const notificationScheduler_1 = __importDefault(require("../services/notificationScheduler"));
const router = express_1.default.Router();
// Get notification statistics (deve vir antes das rotas com parâmetros)
router.get("/stats", auth_1.authenticateToken, notificationController_1.NotificationController.getStats);
// Get all notifications with pagination and filters
router.get("/", auth_1.authenticateToken, notificationController_1.NotificationController.getAll);
// Get notification by ID
router.get("/:id", auth_1.authenticateToken, notificationController_1.NotificationController.getById);
// Create notification
router.post("/", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), notificationController_1.NotificationController.create);
// Mark notification as read
router.patch("/:id/read", auth_1.authenticateToken, notificationController_1.NotificationController.markAsRead);
// Mark all notifications as read
router.patch("/read-all", auth_1.authenticateToken, notificationController_1.NotificationController.markAllAsRead);
// Delete notification
router.delete("/:id", auth_1.authenticateToken, notificationController_1.NotificationController.delete);
// Create payment overdue notifications
router.post("/payment-overdue", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), notificationController_1.NotificationController.createPaymentOverdueNotifications);
// Create birthday notifications
router.post("/birthday", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), notificationController_1.NotificationController.createBirthdayNotifications);
// Create payment due notifications
router.post("/payment-due", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), notificationController_1.NotificationController.createPaymentDueNotifications);
// Execute manual check (for testing)
router.post("/manual-check", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), async (req, res) => {
    try {
        await notificationScheduler_1.default.runManualCheck();
        res.json({ message: "Manual check executed successfully" });
    }
    catch (error) {
        console.error("Error executing manual check:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
