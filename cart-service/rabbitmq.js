const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
  const connection = await amqp.connect('amqp://rabbitmq:5672');
  channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel
};
