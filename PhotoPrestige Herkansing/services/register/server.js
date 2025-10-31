import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/utils/db.js";
import registerRoutes from "./src/routes/register.routes.js";
import { connectRabbit } from "./src/utils/rabbitmq.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
connectDB();
connectRabbit();

// Routes
app.use("/register", registerRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Register Service running on port ${PORT}`));
