const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const os = require('os');
const consul = require('consul')({ host: 'consul' });

const { connectRabbitMQ, sendToQueue } = require('./rabbitmq');

const app = express();
app.use(bodyParser.json());

const serviceName = 'order-service';
const serviceId = `${serviceName}-${os.hostname()}`;
const PORT = 3004;

// Health check for Consul
app.get('/health', (req, res) => res.send('OK'));

// Consul service resolver
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

// Order placement logic
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

// Boot function
(async () => {
  try {
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`✅ Order Service running on port ${PORT}`);

      // Register service with Consul
      consul.agent.service.register({
        id: serviceId,
        name: serviceName,
        address: serviceName,
        port: PORT,
        check: {
          http: `http://${serviceName}:${PORT}/health`,
          interval: '10s',
          timeout: '5s'
        }
      }, (err) => {
        if (err) {
          console.error('❌ Error registering with Consul:', err);
        } else {
          console.log(`📌 Registered ${serviceName} with Consul`);
        }
      });
    });

  } catch (err) {
    console.error('🚨 Startup error:', err.message);
    process.exit(1);
  }
})();
