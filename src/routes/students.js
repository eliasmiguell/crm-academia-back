"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
// Get all students with pagination and filters
router.get("/", auth_1.authenticateToken, studentController_1.StudentController.getAll);
// Get student by ID
router.get("/:id", auth_1.authenticateToken, studentController_1.StudentController.getById);
// Create student
router.post("/", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), studentController_1.StudentController.create);
// Update student
router.put("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN", "MANAGER"]), studentController_1.StudentController.update);
// Delete student
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), studentController_1.StudentController.delete);
// Get student statistics
router.get("/:id/stats", auth_1.authenticateToken, studentController_1.StudentController.getStats);
exports.default = router;
