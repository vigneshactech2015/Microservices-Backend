const express = require('express');
const bodyParser = require('body-parser');
const consul = require('consul')({ host: 'consul' });
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

// Mock inventory data
let stock = {
  'p1': 10,
  'p2': 5,
  'p3': 0
};

// Check stock endpoint
app.post('/inventory/check', (req, res) => {
  const { items } = req.body;

  const outOfStock = items.find(
    (item) => !stock[item.productId] || stock[item.productId] < item.quantity
  );

  if (outOfStock) {
    return res.json({ success: false, message: 'Item out of stock', item: outOfStock });
  }

  // Reserve stock (simulate deduction)
  items.forEach((item) => {
    stock[item.productId] -= item.quantity;
  });

  res.json({ success: true });
});

const PORT = 3006;
const SERVICE_ID = `inventory-service-${uuidv4()}`;

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);

  // Register with Consul
  consul.agent.service.register({
    id: SERVICE_ID,
    name: 'inventory-service',
    address: 'inventory-service',
    port: PORT,
    check: {
      http: `http://inventory-service:${PORT}/health`,
      interval: '10s',
      timeout: '5s'
    }
  }, () => console.log('Inventory Service registered with Consul'));
});

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));
