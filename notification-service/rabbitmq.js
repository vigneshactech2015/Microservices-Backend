const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq:5672';

const connectRabbitMQ = async (onMessage) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = 'order_notifications';
    await channel.assertQueue(queue, { durable: false });

    console.log(`Notification Service: Waiting for messages in queue "${queue}"`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        onMessage(message);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Notification Service: Failed to connect to RabbitMQ', err.message);
  }
};

module.exports = { connectRabbitMQ };
