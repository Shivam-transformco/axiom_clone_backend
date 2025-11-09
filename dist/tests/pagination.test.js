"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pagination_1 = require("../src/utils/pagination");
test('applyPagination returns first page and nextCursor', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const { items: page, nextCursor } = (0, pagination_1.applyPagination)(items, 10);
    expect(page).toHaveLength(10);
    expect(nextCursor).toBeDefined();
});
test('applyPagination uses cursor', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const { nextCursor } = (0, pagination_1.applyPagination)(items, 10);
    const { items: page2 } = (0, pagination_1.applyPagination)(items, 10, nextCursor);
    expect(page2[0].id).toBe(10);
});
