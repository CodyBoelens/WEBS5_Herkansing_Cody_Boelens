import mongoose from "mongoose";

const targetSchema = new mongoose.Schema({
  ownerId: String,
  title: String,
  description: String,
  imageUrl: String,
  latitude: Number,
  longitude: Number,
  radius: Number,
  deadline: Date,
  expired: { type: Boolean, default: false },
});

export default mongoose.model("Target", targetSchema);
