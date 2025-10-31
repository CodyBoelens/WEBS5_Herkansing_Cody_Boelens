import amqp from "amqplib";
import TargetCache from "../models/targetCache.model.js";

let channel;

export async function connectRabbit() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();
    console.log("✅ ScoreService connected to RabbitMQ");

    // Queue for new targets
    await channel.assertQueue("target_created", { durable: true });

    // Queue for expired targets
    await channel.assertQueue("target_expired", { durable: true });

    // Listen for new targets being created
    channel.consume("target_created", async (msg) => {
      if (!msg) return;
      const target = JSON.parse(msg.content.toString());
      console.log("📥 Received target_created:", target.title);

      await TargetCache.findOneAndUpdate(
        { targetId: target._id },
        {
          targetId: target._id,
          title: target.title,
          description: target.description,
          imageUrl: target.imageUrl,
          deadline: target.deadline,
          expired: false,
        },
        { upsert: true }
      );

      channel.ack(msg);
    });

    // Listen for expired targets
    channel.consume("target_expired", async (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      console.log("⌛ Received target_expired:", data.title);

      await TargetCache.findOneAndUpdate(
        { targetId: data.targetId },
        { expired: true }
      );

      console.log(`🔒 Target "${data.title}" marked expired in ScoreService cache`);
      channel.ack(msg);
    });
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}
