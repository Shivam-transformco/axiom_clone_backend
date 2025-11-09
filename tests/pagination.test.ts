import { applyPagination } from '../src/utils/pagination';

test('applyPagination returns first page and nextCursor', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i } as any));
  const { items: page, nextCursor } = applyPagination(items as any, 10);
  expect(page).toHaveLength(10);
  expect(nextCursor).toBeDefined();
});

test('applyPagination uses cursor', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i } as any));
  const { nextCursor } = applyPagination(items as any, 10);
  const { items: page2 } = applyPagination(items as any, 10, nextCursor);
  expect(page2[0].id).toBe(10);
});
