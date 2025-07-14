"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all appointments with pagination and filters
router.get("/", auth_1.authenticateToken, appointmentController_1.AppointmentController.getAll);
// Get appointment by ID
router.get("/:id", auth_1.authenticateToken, appointmentController_1.AppointmentController.getById);
// Create appointment
router.post("/", auth_1.authenticateToken, appointmentController_1.AppointmentController.create);
// Update appointment
router.put("/:id", auth_1.authenticateToken, appointmentController_1.AppointmentController.update);
// Delete appointment
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), appointmentController_1.AppointmentController.delete);
// Get instructor availability
router.get("/availability/:instructorId", auth_1.authenticateToken, appointmentController_1.AppointmentController.getAvailability);
// Get appointment statistics
router.get("/stats/overview", auth_1.authenticateToken, appointmentController_1.AppointmentController.getStats);
exports.default = router;
