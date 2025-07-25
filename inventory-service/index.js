const express = require('express');
const bodyParser = require('body-parser');
const consul = require('consul')({ host: 'consul' });
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(bodyParser.json());

// Mock inventory data
let stock = {
  'p1': 10,
  'p2': 5,
  'p3': 8,
  'p4': 6 ,
  'p5' : 12,
  'p6':15,
  'p7':20,
  'p8':4,
  'p9':9,
  'p10':14,
  'p11':11,
  'p12':7,
  'p13':5,
  'p14':13,
  'p15':10,
  'p16':18,
  'p17':30,
  'p18':8,
  'p19':22,
  'p20':6,
  'p21':12,
  'p22':10,
  'p23':9,
  'p24':25,
  'p25':16,
  'p26':14,
  'p27':17,
  'p28':4,
  'p29':11,
  'p30':20

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
