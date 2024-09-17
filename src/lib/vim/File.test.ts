import { describe, expect, test } from 'vitest';
import { File } from './File'

const TEST_FILE = 
`The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog`


describe('File', () => {
  describe('deleteSelection', () => {

    test("row", () => {
      const file = new File(TEST_FILE);
      
      file.deleteSelection({
        y1: 0,
        x1: 0,
        y2: 0,
        x2: file.lineLength(0) - 1,
      })

      expect(file.toString()).toBe([
        "",
        "jumps over the lazy dog",
        "The quick brown fox",
        "jumps over the lazy dog"
      ].join('\n'));
    });

    test("column", () => {
      const file = new File(TEST_FILE);

      file.deleteSelection({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: file.lineCount() - 1,
      });

      expect(file.toString()).toBe([
        "he quick brown fox",
        "umps over the lazy dog",
        "he quick brown fox",
        "umps over the lazy dog"
      ].join('\n'));
    });
  });

  describe('getSelection', () => {
    test("row left", () => {
      const file = new File(TEST_FILE);
      
      expect(file.getSelection({
        y1: 0,
        x1: 0,
        y2: 0,
        x2: file.lineLength(0) - 1,
      })).toBe("The quick brown fox");
    });

    test("row right", () => {
      const file = new File(TEST_FILE);
      
      expect(file.getSelection({
        y1: 1,
        x1: 22,
        y2: 3,
        x2: 22,
      })).toBe([
        "g",
        "",
        "g",
      ].join('\n'));
    });

    test("column", () => {
      const file = new File(TEST_FILE);

      expect(file.getSelection({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: file.lineCount() - 1,
      })).toBe([
        "T",
        "j",
        "T",
        "j"
      ].join('\n'));
    });

    test("box", () => {
      const file = new File(TEST_FILE);

      expect(file.getSelection({
        x1: 5,
        y1: 1,
        x2: 10,
        y2: 2,
      })).toBe([
       " over ",
       "uick b"
      ].join('\n'));
    });

  });
});
