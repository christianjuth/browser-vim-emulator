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
        y: 0,
        x: 0,
      }, {
        y: 0,
        x: file.lineLength(0) - 1,
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
        x: 0,
        y: 0,
      }, {
        x: 0,
        y: file.lineCount() - 1,
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
        y: 0,
        x: 0,
      }, {
        y: 0,
        x: file.lineLength(0) - 1,
      })).toBe("The quick brown fox");
    });

    test("row right", () => {
      const file = new File(TEST_FILE);
      
      expect(file.getSelection({
        y: 1,
        x: 22,
      }, {
        y: 3,
        x: 22,
      })).toBe([
        "g",
        "",
        "g",
      ].join('\n'));
    });

    test("column", () => {
      const file = new File(TEST_FILE);

      expect(file.getSelection({
        x: 0,
        y: 0,
      }, {
        x: 0,
        y: file.lineCount() - 1,
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
        x: 5,
        y: 1,
      }, {
        x: 10,
        y: 2,
      })).toBe([
       " over ",
       "uick b"
      ].join('\n'));
    });

  });
});
