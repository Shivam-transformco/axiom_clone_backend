"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const routes_1 = require("./routes");
const server_1 = require("./ws/server");
const poller_1 = require("./scheduler/poller");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Serve static demo client
app.use(express_1.default.static('public'));
// Simple response time header
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    const originalWriteHead = res.writeHead;
    res.writeHead = function (...args) {
        try {
            const durMs = Number((process.hrtime.bigint() - start) / 1000000n);
            res.setHeader('X-Response-Time', `${durMs}ms`);
        }
        catch (_) {
            // ignore
        }
        return Function.prototype.apply.call(originalWriteHead, res, args);
    };
    next();
});
(0, routes_1.registerRoutes)(app);
const server = http_1.default.createServer(app);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : '*',
        methods: ['GET', 'POST']
    }
});
const ws = (0, server_1.createWsServer)(io);
const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
    // Start background poller after server begins listening
    (0, poller_1.startPoller)(ws).catch((err) => console.error('Poller start error', err));
    console.log(`Server listening on http://localhost:${port}`);
});
