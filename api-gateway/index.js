const express = require('express');
const consul = require('consul')({ host: 'consul' });
const axios = require('axios');
const app = express();

app.use(express.json());

function resolveService(serviceName) {
  return new Promise((resolve, reject) => {
    consul.catalog.service.nodes(serviceName, (err, result) => {
      if (err || result.length === 0) {
        reject(new Error(`${serviceName} - Service not found`));
      } else {
        const service = result[0];
        const address = service.ServiceAddress || service.Address;
        resolve(`http://${address}:${service.ServicePort}`);
      }
    });
  });
}

app.use('/api/:service/:path', async (req, res) => {
  const { service, path } = req.params;
  console.log(`Resolving service: ${service}`);
  
  try {
    const serviceUrl = await resolveService(service);
    console.log(`Resolved URL: ${serviceUrl}/${path}`);
    const url = `${serviceUrl}/${path}`;
    
    const options = {
      url,
      method: req.method,
      headers: req.headers,
      data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    };
  
    const response = await axios(options);

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`Error forwarding request: ${err.message}`);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
