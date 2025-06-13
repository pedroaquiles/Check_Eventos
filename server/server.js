const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: 'https://segmarket-dash-sandbox-api.azuremicroservices.io/',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' 
  }
}));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}/api`);
});