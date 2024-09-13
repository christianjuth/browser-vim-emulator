import { describe, expect, test } from 'vitest';
import { Vim, SpecialKeys } from './vim'

const TEST_FILE = 
`The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog`


describe('vim', () => {

  describe('keyboard navigation', () => {

    test('gg', () => {
      const vim = new Vim({ file: TEST_FILE });

      vim.keyPress('2')
      vim.keyPress('g'); 
      vim.keyPress('g');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });

      vim.keyPress('g');
      vim.keyPress('g');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
    });

    test('G', () => {
      const vim = new Vim({ file: TEST_FILE });

      vim.keyPress('G');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: vim.file.lineCount() - 1 });

      vim.keyPress('2');
      vim.keyPress('G');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });
    });

    test('h/l', () => {
      const vim = new Vim({ file: TEST_FILE });

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

      vim.keyPress('l');

      expect(vim.getCursorPos()).toEqual({ x: 1, y: 0 });

      vim.keyPress('2');
      vim.keyPress('l');

      expect(vim.getCursorPos()).toEqual({ x: 3, y: 0 });

      vim.keyPress('h');

      expect(vim.getCursorPos()).toEqual({ x: 2, y: 0 });

      vim.keyPress('2');
      vim.keyPress('h');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
    });

    test('j/k', () => {
      const vim = new Vim({ file: TEST_FILE });

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

      vim.keyPress('j');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });

      vim.keyPress('2');
      vim.keyPress('j');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 3 });

      vim.keyPress('k');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 2 });

      vim.keyPress('2');
      vim.keyPress('k');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
    });

    test('0/$', () => {
      const vim = new Vim({ file: TEST_FILE });

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

      vim.keyPress('$');

      expect(vim.getCursorPos()).toEqual({ x: vim.file.lineLength(vim.y) - 1, y: 0 });

      vim.keyPress('0');

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

      vim.keyPress('$');
      vim.keyPress('2');
      // Should ignore 0 if a number was pressed before it
      vim.keyPress('0')

      expect(vim.getCursorPos()).not.toEqual({ x: 0, y: 0 });

      vim.keyPress('Escape');

      vim.keyPress('2');
      vim.keyPress('$');

      expect(vim.getCursorPos()).toEqual({ x: vim.file.lineLength(vim.y) - 1, y: 1 });
    });
  });

  describe('deletion', () => {
    
    test('x', () => {
      const vim = new Vim({ file: TEST_FILE });

      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

      vim.keyPress('x');

      expect(vim.file.getLine(0)).toBe('he quick brown fox');

      vim.keyPress('2');
      vim.keyPress('x');

      expect(vim.file.getLine(0)).toBe(' quick brown fox');

    });

  });

  describe('history', () => {
    const vim = new Vim({ file: TEST_FILE });

    test('u', () => {
      vim.keyPress('x');
      expect(vim.file.getLine(0)).toBe('he quick brown fox');
      vim.keyPress('u');
      expect(vim.file.getLine(0)).toBe('The quick brown fox');
    });
    
    test(SpecialKeys.Ctrl+'r', () => {
      expect(vim.file.getLine(0)).toBe('The quick brown fox');
      vim.keyPress(SpecialKeys.Ctrl+'r');
      expect(vim.file.getLine(0)).toBe('he quick brown fox');
    });

  });

});
