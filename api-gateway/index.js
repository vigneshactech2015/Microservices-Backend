const express = require('express');
const consul = require('consul')({ host: 'consul' });
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configure CORS to allow requests from any origin
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    express.raw({ type: '*/*' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

const serviceCache = {};

function getNextInstance(serviceName, instances) {
  if (!serviceCache[serviceName]) {
    serviceCache[serviceName] = { index: 0 };
  }

  const cache = serviceCache[serviceName];
  const instance = instances[cache.index % instances.length];
  cache.index += 1;
  return instance;
}

function resolveService(serviceName) {
  return new Promise((resolve, reject) => {
    consul.catalog.service.nodes(serviceName, (err, result) => {
      if (err || result.length === 0) {
        reject(new Error(`${serviceName} - Service not found`));
      } else {
        // adding load balancer to product service
        // round - robin load balancer

        // const service = serviceName === 'product-service' ? getNextInstance(serviceName,result) : result[0];
        const service = result[0];
        const address = service.ServiceAddress || service.Address;
        resolve(`http://${address}:${service.ServicePort}`);
      }
    });
  });
}

app.all('/api/:service/*', async (req, res) => {
  const { service } = req.params;
  const path = req.params[0];
  console.log(`Resolving service: ${service}`);

  try {
    const serviceUrl = await resolveService(service);
    const url = `${serviceUrl}/${path}`;
    console.log(`Forwarding request to: ${url}`);

    const headers = { ...req.headers };
    delete headers['host'];

    const options = {
      url,
      method: req.method,
      headers,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      responseType: 'json'
    };

    try {
      const response = await axios(options);
      res.status(response.status).set(response.headers).send(response.data);
    } catch (err) {
      if (err.response) {
        // Forward the error from the microservice
        res.status(err.response.status).send(err.response.data);
      } else {
        // Internal server or network error
        console.error(`Error forwarding request: ${err.message}`);
        res.status(500).send(`Internal Server Error: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error forwarding request: ${err.message}`);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

