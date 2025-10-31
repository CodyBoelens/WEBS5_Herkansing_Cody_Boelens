import Target from "../models/target.model.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { publishMessage } from "../utils/rabbitmq.js";

// ✅ Consistent upload directory (shared via Docker volume)
const uploadDir = "/app/uploads";

// Make sure directory exists (in case container restarts)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer to save files in /app/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// ✅ Create new target
export async function createTarget(req, res) {
  try {
    const { ownerId, title, description, latitude, longitude, radius, deadline } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Save relative path for easier access by other services
    const imageUrl = `/uploads/${req.file.filename}`;

    const target = new Target({
      ownerId,
      title,
      description,
      imageUrl,
      latitude,
      longitude,
      radius,
      deadline,
    });

    await target.save();

    // Notify other services (like ScoreService) via RabbitMQ
    await publishMessage("target_created", target);

    res.status(201).json({
      message: "Target created successfully",
      target,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating target", error: err.message });
  }
}

// ✅ Get all targets
export async function getTargets(req, res) {
  try {
    const targets = await Target.find();
    res.json(targets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching targets", error: err.message });
  }
}

// ✅ Delete target (and its image)
export async function deleteTarget(req, res) {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Target not found" });

    const filePath = path.join("/app", target.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Target.findByIdAndDelete(req.params.id);

    res.json({ message: "Target deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting target", error: err.message });
  }
}
