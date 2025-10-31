import amqp from "amqplib";

let channel;

export async function connectRabbit() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();

    // ✅ maak de queue durable
    await channel.assertQueue("user_registered", { durable: true });

    console.log("🐇 Register Service connected to RabbitMQ");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
    setTimeout(connectRabbit, 5000); // retry na 5s
  }
}

export async function publishMessage(queue, message) {
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  // ✅ zorg dat de queue ook hier durable is
  await channel.assertQueue(queue, { durable: true });

  // ✅ verstuur bericht persistent
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

  console.log(`📨 Sent message to queue "${queue}":`, message);
}
