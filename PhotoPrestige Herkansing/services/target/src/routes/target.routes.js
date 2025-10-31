import express from "express";
import { upload, createTarget, getTargets, deleteTarget } from "../controllers/target.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), createTarget);
router.get("/", getTargets);
router.delete("/:id", deleteTarget);

export default router;
