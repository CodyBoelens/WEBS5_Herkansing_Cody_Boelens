import Score from "../models/score.model.js";
import TargetCache from "../models/targetCache.model.js";
import { uploadToImagga, compareImages } from "../utils/imagga.js";
import multer from "multer";
import path from "path";

const uploadDir = "uploads";
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

export const upload = multer({ storage });

export async function submitScore(req, res) {
  try {
    const { playerId, targetId } = req.body;
    const playerPhoto = req.file;

    if (!playerPhoto) return res.status(400).json({ message: "No image uploaded" });

    const target = await TargetCache.findOne({ targetId });
    if (!target) return res.status(404).json({ message: "Target not found in cache" });
    if (target.expired) {
      return res.status(400).json({ message: "Target has expired — no more scores allowed." });
    }

    

    console.log("📸 Uploading images to Imagga...");
    console.log(`/app/${playerPhoto.path}`)
    console.log(`/app${target.imageUrl}`)
    const playerUploadId = await uploadToImagga(`/app/${playerPhoto.path}`);
    const targetUploadId = await uploadToImagga(`/app${target.imageUrl}`);


    console.log("🔍 Comparing images...");
    const similarity = await compareImages(playerUploadId, targetUploadId);

    const score = new Score({ playerId, targetId, similarity });
    await score.save();

    res.status(201).json({
      message: "✅ Score calculated successfully",
      similarity,
      score,
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Error processing score", error: err.message });
  }
}

export async function getScores(req, res) {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching scores", error: err.message });
  }
}
