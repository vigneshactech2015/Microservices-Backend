const express = require('express');
const consul = require('consul')({ host: 'consul' });
const app = express();
const cartRoutes = require('./routes/cart');

const serviceName = 'cart-service';
const serviceId = 'cart-service';

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.use('/cart',cartRoutes)


const PORT = 3003;
app.listen(PORT, () => {
  console.log(`${serviceName} running on port ${PORT}`);

  consul.agent.service.register({
    id: serviceId,
    name: serviceName,
    address: serviceName,
    port: PORT,
    check: {
      http: `http://${serviceName}:${PORT}/health`,
      interval: '10s'
    }
  }, err => {
    if (err) console.error('Error registering service:', err);
  });
});

