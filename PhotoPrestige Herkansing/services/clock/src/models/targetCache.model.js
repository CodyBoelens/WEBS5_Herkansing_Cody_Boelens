import mongoose from "mongoose";

const targetCacheSchema = new mongoose.Schema({
  targetId: String,
  title: String,
  deadline: Date,
  expired: { type: Boolean, default: false },
});

export default mongoose.model("TargetCache", targetCacheSchema);
