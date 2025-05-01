const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async (retries = 20, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect('amqp://rabbitmq:5672');
      channel = await connection.createChannel();

      await channel.assertQueue('order_notifications', { durable: false });

  
      channel.consume('order_notifications', (msg) => {
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          console.log('🔔 Notification received:', message);
  
          if (message.type === 'ORDER_PLACED') {
            console.log(`📧 Sending notification for Order ID: ${message.data.orderId}`);
          }
  
          channel.ack(msg);
        }
      });
      return;
    } catch (err) {
      console.error(`Order Service: RabbitMQ connection failed (${i + 1}/${retries}) - ${err.message}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Order Service: Failed to connect to RabbitMQ after all retries');
};

const sendToQueue = async (queue, message) => {
  if (!channel) {
    console.error('RabbitMQ channel not initialized');
    return;
  }
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};

module.exports = { connectRabbitMQ, sendToQueue };
