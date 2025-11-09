import { applyPagination } from '../src/utils/pagination';

test('applyPagination returns first page and nextCursor', () => {
  const items: Array<{ id: number }> = Array.from({ length: 25 }, (_, i) => ({ id: i }));
  const { items: page, nextCursor } = applyPagination<{ id: number }>(items, 10);
  expect(page).toHaveLength(10);
  expect(nextCursor).toBeDefined();
});

test('applyPagination uses cursor', () => {
  const items: Array<{ id: number }> = Array.from({ length: 25 }, (_, i) => ({ id: i }));
  const { nextCursor } = applyPagination<{ id: number }>(items, 10);
  const { items: page2 } = applyPagination<{ id: number }>(items, 10, nextCursor);
  expect(page2[0].id).toBe(10);
});
