import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../src/routes';

const app = express();
app.use(express.json());
registerRoutes(app);

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
