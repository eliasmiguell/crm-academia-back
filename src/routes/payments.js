"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all payments with pagination and filters
router.get("/", auth_1.authenticateToken, paymentController_1.PaymentController.getAll);
// Get payment by ID
router.get("/:id", auth_1.authenticateToken, paymentController_1.PaymentController.getById);
// Create payment
router.post("/", auth_1.authenticateToken, paymentController_1.PaymentController.create);
// Update payment
router.put("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), paymentController_1.PaymentController.update);
router.patch("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), paymentController_1.PaymentController.update);
// Enviar e-mail de cobrança manualmente
router.patch("/:id/send-charge-email", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), paymentController_1.PaymentController.sendChargeEmail);
// Delete payment
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), paymentController_1.PaymentController.delete);
// Get payment statistics
router.get("/stats/overview", auth_1.authenticateToken, paymentController_1.PaymentController.getStats);
// Mark overdue payments
router.post("/mark-overdue", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), paymentController_1.PaymentController.markOverdue);
exports.default = router;
