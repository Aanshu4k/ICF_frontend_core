const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/solr', // This is the path to proxy, adjust as needed
    createProxyMiddleware({
      target: 'http://10.125.126.72:8983', // Replace with your Solr server URL
      changeOrigin: true,
    })
  );
};
