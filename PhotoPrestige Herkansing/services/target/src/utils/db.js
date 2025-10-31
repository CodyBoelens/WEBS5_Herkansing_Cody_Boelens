import mongoose from "mongoose";

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/photo_prestige_targets";

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected for Target Service");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    setTimeout(connectMongo, 5000); // retry after 5s
  }
}
