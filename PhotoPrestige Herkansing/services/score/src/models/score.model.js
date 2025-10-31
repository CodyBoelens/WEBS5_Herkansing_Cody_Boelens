import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  targetId: { type: String, required: true },
  similarity: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Score", scoreSchema);
