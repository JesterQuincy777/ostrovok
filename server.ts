import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BACKEND_API_HOST = 'http://185.23.5.170:8090';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Server-side API proxy route to bypass browser Mixed Content (HTTPS -> HTTP) and CORS limits
app.use('/api', async (req, res) => {
  const targetUrl = `${BACKEND_API_HOST}/api${req.url}`;

  try {
    const headers: Record<string, string> = {};
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const backendRes = await fetch(targetUrl, fetchOptions);
    const contentType = backendRes.headers.get('content-type') || 'application/json';

    res.status(backendRes.status);
    res.setHeader('Content-Type', contentType);

    const data = await backendRes.text();
    res.send(data);
  } catch (err: any) {
    console.error('API proxy error:', err);
    res.status(502).json({ error: 'Backend proxy error', details: err?.message });
  }
});

// Mount Vite middleware in dev, or serve static dist in production
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, '../');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} (isProd: ${isProd})`);
});
