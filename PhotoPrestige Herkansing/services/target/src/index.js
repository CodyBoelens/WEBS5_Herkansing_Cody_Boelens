import express from "express";
import dotenv from "dotenv";
import targetRoutes from "./routes/target.routes.js";
import { connectDB } from "./utils/db.js";
import { connectRabbit } from "./utils/rabbitmq.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/targets", targetRoutes);

app.listen(3003, async () => {
  console.log("🎯 Target Service running on port 3003");
  await connectDB();
  await connectRabbit();
});
