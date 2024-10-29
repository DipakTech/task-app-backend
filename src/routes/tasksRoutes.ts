import express from "express";
const router = express.Router();

import {
  getTasks,
  getTask,
  postTask,
  putTask,
  deleteTask,
} from "../controllers/taskController";
import { verifyAccessToken } from "../middlewares/verifyToken";

router.get("/", getTasks);
router.get("/:taskId", verifyAccessToken, getTask);
router.post("/", verifyAccessToken, postTask);
router.put("/:taskId", verifyAccessToken, putTask);
router.delete("/:taskId", verifyAccessToken, deleteTask);

export default router;
