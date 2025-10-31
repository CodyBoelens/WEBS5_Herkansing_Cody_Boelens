import amqp from "amqplib";
import { sendMail } from "../services/mailService.js";

const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

export async function connectRabbit() {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    const queue = "user_registered";

    await channel.assertQueue(queue, { durable: true });

    console.log("📨 Mail Service listening on queue:", queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log("📥 Received message:", data);

        await sendMail(data.email, data.name);

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
    setTimeout(connectRabbit, 5000);
  }
}
