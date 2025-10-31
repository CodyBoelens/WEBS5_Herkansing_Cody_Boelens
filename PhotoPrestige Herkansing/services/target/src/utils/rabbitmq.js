import amqp from "amqplib";

let channel;

export async function connectRabbit() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
    channel = await connection.createChannel();
    console.log("✅ Target Service connected to RabbitMQ");
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
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

  console.log(`📨 Sent message to queue "${queue}"`);
}
