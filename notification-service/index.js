const express = require('express');
const consul = require('consul')({ host: 'consul' });
const os = require('os');
const app = express();

const serviceName = 'notification-service';
const serviceId = `${serviceName}-${os.hostname()}`;

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.get('/notification',(req,res)=>{
  res.send({message:'Notification Service'})
})


const PORT = 3005;
app.listen(PORT, () => {
  console.log(`${serviceName} running on port ${PORT}`);

  // Register service with Consul
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

