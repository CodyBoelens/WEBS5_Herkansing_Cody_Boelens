import amqp from "amqplib";
import TargetCache from "../models/targetCache.model.js";

let channel;

export async function connectRabbit() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
    channel = await connection.createChannel();
    console.log("✅ Score Service connected to RabbitMQ");

    const queue = "target_created";
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      const targetData = JSON.parse(msg.content.toString());
      console.log("📥 Received target:", targetData);

      try {
        await TargetCache.findOneAndUpdate(
          { targetId: targetData._id },
          { ...targetData, targetId: targetData._id },
          { upsert: true, new: true }
        );
        console.log(`💾 Cached target ${targetData._id}`);
      } catch (err) {
        console.error("❌ Error caching target:", err.message);
      }

      channel.ack(msg);
    });
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}
