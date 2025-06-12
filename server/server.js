const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Permitir CORS na origem do navegador
app.use(cors());

// Proxy para a API
app.use('/api', createProxyMiddleware({
  target: 'https://segmarket-dash-sandbox-api.azuremicroservices.io/',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // remove "/api" do caminho final
  }
}));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}/api`);
});