import mongoose from "mongoose";

const targetSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  radius: Number,
  deadline: Date,
}, { timestamps: true });

export default mongoose.model("Target", targetSchema);
