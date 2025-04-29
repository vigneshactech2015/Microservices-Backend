const express = require('express');
const consul = require('consul')({ host: 'consul' });
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    express.raw({ type: '*/*' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

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

    const response = await axios(options);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`Error forwarding request: ${err.message}`);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

