import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'anthropic-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/anthropic/')) {
            // Handle Anthropic API requests
            const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API key not configured' }));
              return;
            }

            // Read request body
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const anthropicUrl = req.url.replace('/api/anthropic', 'https://api.anthropic.com');

                const response = await fetch(anthropicUrl, {
                  method: req.method,
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                  },
                  body: body
                });

                const data = await response.text();
                res.writeHead(response.status, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
})
