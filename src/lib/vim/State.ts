import { File } from './File';
import { Vim, Mode } from './Vim';

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

export class State {
  readonly file: File;
  x: number = 0;
  y: number = 0;
  prevState?: State;
  nextState?: State;
  vim: Vim;
  constructor(file: File, vim: Vim) {
    this.file = file;
    this.vim = vim;
  }
  clone() {
    const state = new State(this.file.clone(), this.vim);
    state.x = this.x;
    state.y = this.y;
    return state;
  }

  setX(x: number | ((x: number) => number)) {
    const xAsNumber = typeof x === 'function' ? x(this.x) : x;
    const isInsertMode = this.vim.getMode() === Mode.Insert;
    const maxLineLength = Math.max(0, this.file.lineLength(this.y) - (isInsertMode ? 0 : 1));
    this.x = clamp(0, maxLineLength, xAsNumber);
  }

  getX() {
    const isInsertMode = this.vim.getMode() === Mode.Insert;
    const maxLineLength = Math.max(0, this.file.lineLength(this.y) - (isInsertMode ? 0 : 1));
    return clamp(0, maxLineLength, this.x);
  }

  setY(y: number | ((y: number) => number)) {
    const yAsNumber = typeof y === 'function' ? y(this.y) : y;
    const maxHeight = Math.max(0, this.file.lineCount() - 1);
    this.y = clamp(0, maxHeight, yAsNumber);
  }

  getY() {
    const maxHeight = Math.max(0, this.file.lineCount() - 1);
    return clamp(0, maxHeight, this.y);
  }

  getCharacterUnderCursor() {
    return this.file.getLine(this.y)?.charAt(this.x);
  }

  moveCursorForward() {
    const startX = this.x;
    this.setX(this.x + 1);
    if (startX === this.x && this.y < this.file.lineCount() - 1) {
      this.setX(0);
      this.setY(this.y + 1);
    }
    return this;
  }

  moveCursorBackward() {
    if (this.x > 0) {
      this.setX(this.x - 1);
    } else if (this.y > 0) {
      this.setY(this.y - 1);
      this.setX(this.file.lineLength(this.y) - 1);
    }
    return this;
  }

  isEndOfFile() {
    return this.y === this.file.lineCount() - 1 && this.x === this.file.lineLength(this.y) - 1;
  }

  isStartOfFile() {
    return this.y === 0 && this.x === 0;
  }

  isEndOfLine() {
    return this.getX() === this.file.lineLength(this.y) - 1;
  }

  insertTextAtCursor(text: string) {
    this.file.insertText(text, this.x, this.y);
    this.setX(x => x + text.length);
  }

  deleteTextAtCursor() {
    const isInsertMode = this.vim.getMode() === Mode.Insert;
    const x = this.getX() - (isInsertMode ? 1 : 0);
    const y = this.getY();
    this.file.deleteSelection(
      { 
        x1: x, 
        y1: y,
        x2: x,
        y2: y
      },
    );
    if (isInsertMode) {
      this.moveCursorBackward();
    }
  }
}
