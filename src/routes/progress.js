"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const progressController_1 = require("../controllers/progressController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all progress records with pagination and filters
router.get("/", auth_1.authenticateToken, progressController_1.ProgressController.getAll);
// Get progress record by ID
router.get("/:id", auth_1.authenticateToken, progressController_1.ProgressController.getById);
// Create progress record
router.post("/", auth_1.authenticateToken, progressController_1.ProgressController.create);
// Update progress record
router.put("/:id", auth_1.authenticateToken, progressController_1.ProgressController.update);
// Delete progress record
router.delete("/:id", auth_1.authenticateToken, progressController_1.ProgressController.delete);
// Get student progress history
router.get("/student/:studentId/history", auth_1.authenticateToken, progressController_1.ProgressController.getStudentHistory);
exports.default = router;
