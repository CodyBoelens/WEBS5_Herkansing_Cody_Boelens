import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import { connectRabbit } from "./utils/rabbitmq.js";
import scoreRoutes from "./routes/score.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/scores", scoreRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, async () => {
  console.log(`🏆 Score Service running on port ${PORT}`);
  await connectDB();
  await connectRabbit();
});
