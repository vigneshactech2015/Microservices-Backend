const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const consul = require('consul')({ host: 'consul' });
const cors = require('cors');
const CircuitBreaker = require('opossum');

const { connectRabbitMQ, sendToQueue } = require('./rabbitmq');

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(bodyParser.json());

const serviceName = 'order-service';
const serviceId = 'order-service';
const PORT = 3004;

// Health check
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

// Mocking the payment
const mockPaymentProcess = async () => {
  const isSuccess = Math.random() > 0.5;
  await new Promise((res) => setTimeout(res, 1000));
  if (isSuccess) return { success: true };
  else throw new Error('Payment failed due to insufficient funds');
};

const breakerOptions = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 5000
};

const inventoryBreaker = new CircuitBreaker(async (items) => {
  const inventoryUrl = await resolveService('inventory-service');
  const response = await axios.post(`${inventoryUrl}/inventory/check`, { items });
  return response.data;
}, breakerOptions);

const paymentBreaker = new CircuitBreaker(mockPaymentProcess, breakerOptions);

app.post('/order/place', async (req, res) => {
  const { userId, items } = req.body;

  try {
    const inventoryCheck = await inventoryBreaker.fire(items);

    if (!inventoryCheck.success) {
      return res.status(400).json({
        success: false,
        message: 'Item out of stock',
        item: inventoryCheck.item,
      });
    }

    // Simulate payment
    try {
      await paymentBreaker.fire();
    } catch (paymentError) {
      await sendToQueue('order_notifications', {
        type: 'ORDER_PAYMENT_FAILED',
        data: {
          userId,
          items,
          reason: paymentError.message,
          timestamp: new Date().toISOString()
        },
      });

      return res.status(402).json({
        success: false,
        message: paymentError.message,
      });
    }

    const order = {
      orderId: `order-${Date.now()}`,
      userId,
      status: 'placed',
      timestamp: new Date().toISOString(),
    };

    await sendToQueue('order_notifications', {
      type: 'ORDER_PLACED',
      data: order,
    });

    res.status(200).json({ success: true, order });

  } catch (err) {
    console.error('❌ Order placement error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

(async () => {
  try {
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`✅ Order Service running on port ${PORT}`);

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
