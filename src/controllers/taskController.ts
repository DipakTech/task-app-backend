import { prisma } from "../db";
import { Request, Response } from "express";
import { RequestHandler } from "express";
import { User } from "@prisma/client";

interface AuthRequest extends Request {
  user?: User;
}

export const getTasks: RequestHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTasks = await prisma.task.count();
    const totalPages = Math.ceil(totalTasks / limit);

    const tasks = await prisma.task.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalTasks,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    res.status(200).json({
      tasks,
      pagination,
      status: true,
      msg: "Tasks found successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};

export const getTask: RequestHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const taskId = req.params.taskId;
    const user = req.user;

    if (!user) {
      res.status(200).json({ tasks: [], status: true, msg: "No tasks found." });
      return;
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!task) {
      res.status(404).json({ status: false, msg: "No task found." });
      return;
    }

    res.status(200).json({
      task,
      status: true,
      msg: "Task found successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};

export const postTask: RequestHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    const user = req.user;

    if (!user) {
      res.status(200).json({ tasks: [], status: true, msg: "No tasks found." });
      return;
    }

    if (!title) {
      res.status(400).json({ status: false, msg: "Title is required" });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        userId: user.id,
      },
    });

    res.status(201).json({
      task,
      status: true,
      msg: "Task created successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};

export const putTask: RequestHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const taskId = req.params.taskId;
    const { title, description, status } = req.body;
    const user = req.user;

    if (!user) {
      res.status(200).json({ tasks: [], status: true, msg: "No tasks found." });
      return;
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      res.status(404).json({ status: false, msg: "Task not found" });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
      },
    });

    res.status(200).json({
      task: updatedTask,
      status: true,
      msg: "Task updated successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};

export const deleteTask: RequestHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const taskId = req.params.taskId;
    const user = req.user;

    if (!user) {
      res.status(200).json({ tasks: [], status: true, msg: "No tasks found." });
      return;
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      res.status(404).json({ status: false, msg: "Task not found" });
      return;
    }

    if (existingTask.userId !== user.id) {
      res.status(403).json({
        status: false,
        msg: "You can't delete task of another user",
      });
      return;
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    res.status(200).json({
      status: true,
      msg: "Task deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};
