import express from "express";
import { submitScore, getScores, upload } from "../controllers/score.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), submitScore);
router.get("/", getScores);

export default router;
