import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}`, role: req.user.role });
});

export default router;
