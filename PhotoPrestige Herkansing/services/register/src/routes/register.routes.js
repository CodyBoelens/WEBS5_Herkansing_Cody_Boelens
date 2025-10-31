import express from "express";
import { registerParticipant, getAllRegistrations } from "../controllers/register.controller.js";

const router = express.Router();

router.post("/", registerParticipant);
router.get("/", getAllRegistrations);

export default router;
