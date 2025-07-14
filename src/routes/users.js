"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Get all users (Admin only)
router.get("/", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), userController_1.UserController.getAll);
// Get current user profile
router.get("/profile", auth_1.authenticateToken, userController_1.UserController.getProfile);
// Update current user profile
router.put("/profile", auth_1.authenticateToken, userController_1.UserController.updateProfile);
// Create user (Admin only)
router.post("/", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), userController_1.UserController.create);
// Update user (Admin only)
router.put("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), userController_1.UserController.update);
// Delete user (Admin only)
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.requireRole)(["ADMIN"]), userController_1.UserController.delete);
// Get instructors list
router.get("/instructors", auth_1.authenticateToken, userController_1.UserController.getInstructors);
// Get user statistics
router.get("/:id/stats", auth_1.authenticateToken, userController_1.UserController.getStats);
exports.default = router;
