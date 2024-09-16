import { describe, expect, test, vi } from 'vitest';
import { repeat } from './utils'

describe('utils', () => {
  
  describe('repeat', () => {

    test.each([
      1,
      2,
      3,
    ])('%sx', (n) => {
      const callback = vi.fn();
      repeat(n, callback);
      expect(callback).toHaveBeenCalledTimes(n);
    });

  });

});
