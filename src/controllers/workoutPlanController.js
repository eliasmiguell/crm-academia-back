"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanController = void 0;
const prisma_1 = require("../lib/prisma");
const schema_1 = require("../lib/schema");
class WorkoutPlanController {
    static async getAll(req, res, next) {
        try {
            const page = Number.parseInt(req.query.page) || 1;
            const limit = Number.parseInt(req.query.limit) || 10;
            const studentId = req.query.studentId;
            const instructorId = req.query.instructorId;
            const status = req.query.status;
            const skip = (page - 1) * limit;
            const where = {};
            if (studentId)
                where.studentId = studentId;
            if (instructorId)
                where.instructorId = instructorId;
            if (status)
                where.status = status;
            const [workoutPlans, total] = await Promise.all([
                prisma_1.prisma.workoutPlan.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        exercises: true,
                    },
                }),
                prisma_1.prisma.workoutPlan.count({ where }),
            ]);
            res.json({
                workoutPlans,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const workoutPlan = await prisma_1.prisma.workoutPlan.findUnique({
                where: { id: req.params.id },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            objectives: true,
                            medicalRestrictions: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    exercises: {
                        orderBy: { order: "asc" },
                    },
                },
            });
            if (!workoutPlan) {
                return res.status(404).json({ error: "Workout plan not found" });
            }
            res.json(workoutPlan);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const validatedData = schema_1.createWorkoutPlanSchema.parse(req.body);
            const workoutPlan = await prisma_1.prisma.workoutPlan.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                    studentId: validatedData.studentId,
                    instructorId: validatedData.instructorId,
                    status: "ACTIVE",
                    startDate: new Date(),
                    exercises: {
                        create: validatedData.exercises.map((exercise, index) => ({
                            name: exercise.name,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            weight: exercise.weight || null,
                            restTime: exercise.restTime ? Number(exercise.restTime) : null,
                            instructions: exercise.notes || null,
                            order: index + 1,
                        })),
                    },
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    exercises: true,
                },
            });
            res.status(201).json({
                message: "Workout plan created successfully",
                workoutPlan,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const validatedData = schema_1.createWorkoutPlanSchema.partial().parse(req.body);
            const updateData = {
                name: validatedData.name,
                description: validatedData.description,
                student: validatedData.studentId ? { connect: { id: validatedData.studentId } } : undefined,
                instructor: validatedData.instructorId ? { connect: { id: validatedData.instructorId } } : undefined,
            };
            if (validatedData.exercises) {
                await prisma_1.prisma.exercise.deleteMany({
                    where: { workoutPlanId: req.params.id },
                });
                updateData.exercises = {
                    create: validatedData.exercises.map((exercise, index) => ({
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight || null,
                        restTime: exercise.restTime ? Number(exercise.restTime) : null,
                        instructions: exercise.notes || null,
                        order: index + 1,
                    })),
                };
            }
            const workoutPlan = await prisma_1.prisma.workoutPlan.update({
                where: { id: req.params.id },
                data: updateData,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    exercises: {
                        orderBy: { order: "asc" },
                    },
                },
            });
            res.json({
                message: "Workout plan updated successfully",
                workoutPlan,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleActive(req, res, next) {
        try {
            const workoutPlan = await prisma_1.prisma.workoutPlan.findUnique({
                where: { id: req.params.id },
                select: { status: true },
            });
            if (!workoutPlan) {
                return res.status(404).json({ error: "Workout plan not found" });
            }
            const newStatus = workoutPlan.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
            const updatedWorkoutPlan = await prisma_1.prisma.workoutPlan.update({
                where: { id: req.params.id },
                data: { status: newStatus },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            res.json({
                message: `Workout plan ${updatedWorkoutPlan.status === "ACTIVE" ? "activated" : "deactivated"} successfully`,
                workoutPlan: updatedWorkoutPlan,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await prisma_1.prisma.workoutPlan.delete({
                where: { id: req.params.id },
            });
            res.json({ message: "Workout plan deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async copy(req, res, next) {
        try {
            const { studentId, name } = req.body;
            if (!studentId || !name) {
                return res.status(400).json({ error: "Student ID and name are required" });
            }
            const originalPlan = await prisma_1.prisma.workoutPlan.findUnique({
                where: { id: req.params.id },
                include: {
                    exercises: true,
                },
            });
            if (!originalPlan) {
                return res.status(404).json({ error: "Workout plan not found" });
            }
            const copiedPlan = await prisma_1.prisma.workoutPlan.create({
                data: {
                    name,
                    description: originalPlan.description,
                    studentId,
                    instructorId: originalPlan.instructorId,
                    status: "ACTIVE",
                    startDate: new Date(),
                    exercises: {
                        create: originalPlan.exercises.map((exercise) => ({
                            name: exercise.name,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            weight: exercise.weight,
                            restTime: exercise.restTime,
                            instructions: exercise.instructions,
                            order: exercise.order,
                        })),
                    },
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    exercises: true,
                },
            });
            res.status(201).json({
                message: "Workout plan copied successfully",
                workoutPlan: copiedPlan,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WorkoutPlanController = WorkoutPlanController;
