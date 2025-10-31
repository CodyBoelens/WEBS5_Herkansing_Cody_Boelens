import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import { connectRabbit, recoverScheduledTargets } from "./utils/rabbitmq.js";
import { connectPublisher } from "./utils/rabbitmqPublisher.js";

dotenv.config();

await connectDB();
await connectPublisher();
await connectRabbit();

await recoverScheduledTargets();

console.log("🕒 ClockService running and listening for target creation events...");
