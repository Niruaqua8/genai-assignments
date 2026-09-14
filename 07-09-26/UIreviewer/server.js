const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const WEBHOOK_URL = 'http://localhost:5678/webhook/f3c8af0a-52f7-4199-a48d-581e188dfbff';
const FALLBACK_WEBHOOK_URL = 'http://localhost:5678/webhook/7549f40a-6196-4ba2-af4a-c2e14029c759';
const WEBHOOK_AUTHORIZATION = process.env.N8N_WEBHOOK_AUTHORIZATION || '';
const ROOT = __dirname;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function serveStaticFile(res, filePath) {
  const safePath = path.normalize(filePath).replace(/^\.(?:\/|\\)?/, '');
  const targetPath = path.join(ROOT, safePath);

  fs.readFile(targetPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.url === '/api/review') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};

        const upstreamHeaders = { 'Content-Type': 'application/json' };
        if (WEBHOOK_AUTHORIZATION) {
          upstreamHeaders.Authorization = WEBHOOK_AUTHORIZATION;
        }

        const upstreamResponse = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: upstreamHeaders,
          body: JSON.stringify(payload)
        });

        const contentType = upstreamResponse.headers.get('content-type') || '';
        const text = await upstreamResponse.text();

        if (!upstreamResponse.ok) {
          sendJson(res, upstreamResponse.status, {
            error: 'Webhook request failed',
            status: upstreamResponse.status,
            details: upstreamResponse.status === 401
              ? 'n8n requires webhook authorization. Set N8N_WEBHOOK_AUTHORIZATION and restart the UI server.'
              : text || 'n8n endpoint returned an error.'
          });
          return;
        }

        if (contentType.includes('application/json')) {
          if (!text.trim()) {
            const fallbackResponse = await fetch(FALLBACK_WEBHOOK_URL, {
              method: 'POST',
              headers: upstreamHeaders,
              body: JSON.stringify(payload)
            });
            const fallbackText = await fallbackResponse.text();

            if (fallbackResponse.ok && fallbackText.trim()) {
              res.writeHead(200, {
                'Content-Type': fallbackResponse.headers.get('content-type') || 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(fallbackText);
              return;
            }

            sendJson(res, 502, {
              error: 'Empty webhook response',
              message: 'The n8n webhook is reachable, but the workflow returned no review data from either configured route.'
            });
            return;
          }

          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(text);
            return;
          } catch (jsonError) {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ message: text }));
            return;
          }
        }

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(text || 'Review successful');
      } catch (error) {
        sendJson(res, 502, {
          error: 'Unable to reach n8n webhook',
          message: error.code === 'ECONNREFUSED'
            ? 'n8n is not running on localhost:5678. Start n8n and retry.'
            : error.message || 'The local n8n webhook is not available.'
        });
      }
    });
    return;
  }

  let requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  if (requestPath.startsWith('/')) {
    requestPath = requestPath.substring(1);
  }

  serveStaticFile(res, requestPath || 'index.html');
});

server.listen(PORT, () => {
  console.log(`StoryMind UI is running at http://localhost:${PORT}`);
  console.log(`Proxying to n8n: ${WEBHOOK_URL}`);
});
