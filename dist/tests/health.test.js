"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("../src/routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, routes_1.registerRoutes)(app);
test('GET /health returns ok', async () => {
    const res = await (0, supertest_1.default)(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
});
