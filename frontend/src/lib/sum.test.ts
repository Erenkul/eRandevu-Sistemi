import { describe, it, expect } from 'vitest';

function sum(a: number, b: number) {
  return a + b;
}

describe('sum utility', () => {
  it('should calculate the sum correctly', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(5, -2)).toBe(3);
    expect(sum(0, 0)).toBe(0);
  });
});
