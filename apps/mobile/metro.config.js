const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/api/')) {
        const proxyReq = https.request(
          'https://zeedo.bid' + req.url,
          {
            method: req.method,
            headers: {
              ...req.headers,
              host: 'zeedo.bid',
              origin: 'https://zeedo.bid',
              referer: 'https://zeedo.bid',
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        proxyReq.on('error', (err) => {
          console.error('Metro API proxy error:', err);
          res.writeHead(502);
          res.end(JSON.stringify({ error: 'Proxy error connecting to zeedo.bid' }));
        });

        req.pipe(proxyReq);
        return;
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
