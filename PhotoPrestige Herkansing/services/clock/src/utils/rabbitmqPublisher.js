import amqp from "amqplib";

let channel;

export async function connectPublisher() {
  const connection = await amqp.connect("amqp://rabbitmq:5672");
  channel = await connection.createChannel();
}

export async function publishMessage(queue, message) {
  if (!channel) {
    console.error("❗ RabbitMQ publisher channel not ready");
    return;
  }

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`📨 Sent message to "${queue}"`, message);
}
