import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ORDERS_FILE = path.resolve(process.cwd(), 'orders.json');

// Initialize orders file if not exists
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// API Routes
app.get('/api/orders', (_req, res) => {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(raw || '[]');
    const newOrder = req.body;
    orders.unshift(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(raw || '[]');
    const { id } = req.params;
    const { status } = req.body;
    const orderIndex = orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    orders[orderIndex].status = status;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json(orders[orderIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Vite middlewares
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const hasDist = fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'));

  if (!isProd || !hasDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API GET requests
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

startServer();
