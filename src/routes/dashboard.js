"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
// Get dashboard overview statistics
router.get("/overview", auth_1.authenticateToken, dashboardController_1.DashboardController.getOverview);
// Get recent activities
router.get("/recent-activities", auth_1.authenticateToken, dashboardController_1.DashboardController.getRecentActivities);
// Get monthly revenue chart data
router.get("/revenue-chart", auth_1.authenticateToken, dashboardController_1.DashboardController.getRevenueChart);
// Get student growth chart data
router.get("/student-growth", auth_1.authenticateToken, dashboardController_1.DashboardController.getStudentGrowth);
// Get upcoming payments
router.get("/upcoming-payments", auth_1.authenticateToken, dashboardController_1.DashboardController.getUpcomingPayments);
exports.default = router;
