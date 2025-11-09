"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPagination = applyPagination;
function applyPagination(items, limit, cursor) {
    const startIndex = cursor ? Number(Buffer.from(cursor, 'base64').toString('utf-8')) : 0;
    const slice = items.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + slice.length;
    const nextCursor = nextIndex < items.length ? Buffer.from(String(nextIndex), 'utf-8').toString('base64') : undefined;
    return { items: slice, nextCursor };
}
