import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ["player", "owner"], default: "player" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Registration", registerSchema);
