import mongoose from "mongoose";

const targetCacheSchema = new mongoose.Schema({
  targetId: { type: String, required: true, unique: true },
  ownerId: String,
  title: String,
  description: String,
  imageUrl: String,
  latitude: Number,
  longitude: Number,
  radius: Number,
  deadline: Date,
  createdAt: Date,
});

export default mongoose.model("TargetCache", targetCacheSchema);
