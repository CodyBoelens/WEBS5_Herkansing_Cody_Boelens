import amqp from "amqplib";
import TargetCache from "../models/targetCache.model.js";
import { publishMessage } from "./rabbitmqPublisher.js";

let channel;

// --- Helper: schedule an expiration event ---
async function scheduleExpiration(target) {
  const now = Date.now();
  const deadlineTime = new Date(target.deadline).getTime();
  const delay = deadlineTime - now;

  if (delay <= 0) {
    await markExpired(target);
    return;
  }

  console.log(
    `⏰ Scheduling expiration for "${target.title}" in ${Math.round(
      delay / 1000
    )} seconds`
  );

  setTimeout(async () => {
    await markExpired(target);
  }, delay);
}

// --- Helper: mark target as expired and publish ---
async function markExpired(target) {
  console.log(`⌛ Target expired: ${target.title}`);
  await TargetCache.findOneAndUpdate({ targetId: target.targetId }, { expired: true });

  await publishMessage("target_expired", {
    targetId: target.targetId,
    title: target.title,
    expiredAt: new Date(),
  });
}

// --- Main: connect to RabbitMQ ---
export async function connectRabbit() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();

    console.log("✅ ClockService connected to RabbitMQ");

    await channel.assertQueue("target_created", { durable: true });

    // --- Consume new target_created messages ---
    channel.consume("target_created", async (msg) => {
      if (msg) {
        const target = JSON.parse(msg.content.toString());
        console.log("📥 Received new target:", target.title);

        // Save target in cache
        await TargetCache.findOneAndUpdate(
          { targetId: target._id },
          {
            targetId: target._id,
            title: target.title,
            deadline: target.deadline,
            expired: false,
          },
          { upsert: true }
        );

        // Schedule expiration
        await scheduleExpiration({
          targetId: target._id,
          title: target.title,
          deadline: target.deadline,
        });

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}

export async function recoverScheduledTargets() {
  const activeTargets = await TargetCache.find({ expired: false });
  console.log(`🔁 Recovering ${activeTargets.length} active targets...`);

  for (const target of activeTargets) {
    await scheduleExpiration(target);
  }
}
