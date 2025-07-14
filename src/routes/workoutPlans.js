"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workoutPlanController_1 = require("../controllers/workoutPlanController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all workout plans
router.get("/", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.getAll);
// Get workout plan by id
router.get("/:id", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.getById);
// Create workout plan
router.post("/", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.create);
// Update workout plan
router.patch("/:id", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.update);
// Delete workout plan
router.delete("/:id", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.delete);
// Toggle workout plan active status
router.patch("/:id/toggle-active", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.toggleActive);
// Copy workout plan
router.post("/:id/copy", auth_1.authenticateToken, workoutPlanController_1.WorkoutPlanController.copy);
exports.default = router;
