"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWsServer = createWsServer;
function createWsServer(io) {
    io.on('connection', (socket) => {
        // In a real app, we could join rooms by query, chain, etc.
        socket.emit('hello', { ts: Date.now() });
    });
    return {
        emitInitial(tokens) {
            io.emit('tokens:init', { items: tokens, ts: Date.now() });
        },
        emitUpdates(updates) {
            if (!updates.length)
                return;
            io.emit('tokens:update', { updates, ts: Date.now() });
        }
    };
}
