const express = require('express');
const consul = require('consul')({ host: 'consul' });
const app = express();
const ip = require('ip');

const serviceName = 'product-service';
const serviceId = 'product-service';

app.use(express.json());


const PRODUCTS = [
  { id: 'p1', name: 'iPhone 14', category: 'electronics', description: 'Smartphone', price: 999, stock: 10 },
  { id: 'p2', name: 'MacBook Air', category: 'electronics', description: 'Laptop', price: 1199, stock: 5 }
];

app.get('/health', (req, res) => res.send('OK'));


app.get('/products', (req, res) => {
  const { search = '', category = '' } = req.query;
  const result = PRODUCTS.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || search === '') &&
    (p.category.toLowerCase() === category.toLowerCase() || category === '')
  );
  
  res.status(200).json(result);
})

app.get('/products/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (product) return res.status(200).json(product);
  res.status(404).json({ message: 'Product not found' });
})

const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`${serviceName} running on port ${PORT}`);

  // Register service with Consul
  consul.agent.service.register({
    id: serviceId,
    name: serviceName,
    address: ip.address(),
    port: PORT,
    check: {
      http: `http://product-service:${PORT}/health`,
      interval: '10s'
    }
  }, err => {
    if (err) console.error('Error registering service:', err);
  });
});








