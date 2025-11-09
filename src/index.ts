import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerRoutes } from './routes';
import { createWsServer } from './ws/server';
import { startPoller } from './scheduler/poller';

const app = express();
app.use(express.json());

// Serve static demo client
app.use(express.static('public'));

// Simple response time header
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args: any[]) {
    try {
      const durMs = Number((process.hrtime.bigint() - start) / 1000000n);
      res.setHeader('X-Response-Time', `${durMs}ms`);
    } catch (_) {
      // ignore
    }
    return Function.prototype.apply.call(originalWriteHead, res, args as any);
  } as any;
  next();
});

registerRoutes(app);

const server = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST']
  }
});
const ws = createWsServer(io);

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  // Start background poller after server begins listening
  startPoller(ws).catch((err: unknown) => console.error('Poller start error', err));
  console.log(`Server listening on http://localhost:${port}`);
});
