const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const consul = require('consul')({ host: 'consul' });
const { connectRabbitMQ, sendToQueue } = require('./rabbitmq');

const app = express();
app.use(bodyParser.json());

const resolveService = (name) =>
  new Promise((resolve, reject) => {
    consul.catalog.service.nodes(name, (err, result) => {
      if (err || result.length === 0) {
        reject(`${name} service not found`);
      } else {
        const node = result[0];
        resolve(`http://${node.ServiceAddress || node.Address}:${node.ServicePort}`);
      }
    });
  });

app.post('/order/place', async (req, res) => {
  const { userId, items } = req.body;

  try {
    const inventoryUrl = await resolveService('inventory-service');
    const inventoryCheck = await axios.post(`${inventoryUrl}/inventory/check`, { items });

    if (!inventoryCheck.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Item out of stock',
        item: inventoryCheck.data.item,
      });
    }

    const order = {
      orderId: `order-${Date.now()}`,
      userId,
      items,
      status: 'placed',
      timestamp: new Date().toISOString(),
    };

    await sendToQueue('order_notifications', {
      type: 'ORDER_PLACED',
      data: order,
    });

    res.json({ success: true, order });

  } catch (err) {
    console.error('Order placement error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3004;
(async () => {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Prevent running without RabbitMQ
  }
})();
