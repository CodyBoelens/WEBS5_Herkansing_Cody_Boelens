import amqp from "amqplib";
import Target from "../models/target.model.js";

let channel;

export async function connectRabbit() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();
    console.log("✅ TargetService connected to RabbitMQ");

    // Listen for expiration events
    await channel.assertQueue("target_expired", { durable: true });

    channel.consume("target_expired", async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        console.log("⌛ Received target_expired event:", data.title);

        await Target.findByIdAndUpdate(data.targetId, { expired: true });
        console.log(`🔒 Target "${data.title}" marked as expired`);

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}

export async function publishMessage(queue, message) {
  if (!channel) {
    console.error("❗ RabbitMQ channel not initialized");
    return;
  }

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`📨 Sent message to "${queue}":`, message);
}
