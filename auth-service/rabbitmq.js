const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
  const connection = await amqp.connect('amqp://rabbitmq');
  channel = await connection.createChannel();
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel
};
