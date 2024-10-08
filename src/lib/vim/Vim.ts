import { File } from "./File"
import { KeyEvent } from './KeyEvent'
import { State } from './State'
import { repeat } from './utils'

export enum Mode {
  Normal = 'normal',
  Insert = 'insert',
  Visual = 'visual',
  VisualLine = 'visual line',
  VisualBlock = 'visual block',
}

type HighlightSelection = {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

export class Vim {
  keyBuffer?: KeyEvent;

  state: State

  stateChangeListener?: () => void;
  visualSelectionStartState?: State;
  private mode = Mode.Normal;

  constructor({ 
    file, 
    onStateChange 
  }: { 
    file: string, 
    onStateChange?: () => void 
  }) {
    this.stateChangeListener = onStateChange;
    this.state = new State(new File(file), this);
  }

  currentLine() {
    return this.file.getLine(this.state.getY());
  }

  currentLineLength() {
    return this.file.lineLength(this.state.getY());
  }

  get file() {
    return this.state.file;
  }

  mutateState(mutator: (state: State) => State | void) {
    const newState = this.state.clone();
    newState.prevState = this.state;
    this.state.nextState = newState;
    this.state = mutator(newState) || newState;
  }

  getLines() {
    return this.file.getLines();
  }

  toString() {
    return this.file.toString()
  }

  getCursorPos() {
    return {
      x: this.state.getX(),
      y: this.state.getY(),
    }
  }

  keyPress(key: KeyEvent | string) {
    if (typeof key === 'string') {
      key = new KeyEvent({
        key,
        ctrlKey: false,
        shiftKey: false,
      });
    }

    const lastKey = this.keyBuffer;

    if (lastKey && lastKey.canBeCombined(key)) {
      lastKey.combine(key);
    } else {
      key.prevKey = lastKey;
      this.keyBuffer = key;
    }

    this.reducer();
    this.notifyStateChange();
  }

  reducer() {
    const lastKey = this.keyBuffer;
    
    if (!lastKey) {
      return;
    }

    if (lastKey.key === 'Escape') {
      this.visualSelectionStartState = undefined;
      delete this.keyBuffer;
      this.mode = Mode.Normal;
      //  reclamp cursor position on mode change
      this.state.setX(x => x);
      return;
    }

    switch (this.mode) {
      case Mode.Normal:
        this.normalReducer(lastKey);
        break;
      case Mode.Insert:
        this.insertReducer(lastKey);
        break;
      case Mode.Visual:
      case Mode.VisualLine:
      case Mode.VisualBlock:
        this.visualReducer(lastKey);
        break;
    }
  }

  keyBufferPop(n: number) {
    for (let i = 0; i < n; i++) {
      this.keyBuffer = this.keyBuffer?.prevKey;
    }
  }

  motionReducer(lastKey: KeyEvent) {
    const prevNumber = lastKey.prevKey?.number;
    switch (lastKey.key) {
      case 'h':
      case 'ArrowLeft':
        repeat(prevNumber || 1, () => {
          this.state.moveCursorBackward();
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'j':
      case 'ArrowDown':
        repeat(prevNumber || 1, () => {
          this.state.setY(y => y + 1);
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'k':
      case 'ArrowUp':
        repeat(prevNumber || 1, () => {
          this.state.setY(y => y - 1);
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'l':
      case 'ArrowRight':
        repeat(prevNumber || 1, () => {
          this.state.moveCursorForward();
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'G':
        if (prevNumber) {
          this.state.setY(prevNumber - 1);
        } else {
          this.state.setY(this.file.lineCount() - 1);
        }
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'g':
        if (lastKey.prevKey?.key === 'g') {
          if (lastKey.prevKey.prevKey?.number) {
            this.state.setY(lastKey.prevKey.prevKey.number - 1);
          } else {
            this.state.setY(0);
          }
          this.keyBufferPop(lastKey.prevKey.prevKey?.number !== undefined ? 3 : 2);
        } 
        return;
      case 'W':
      case 'w':
        this.state.moveCursorForward();
        repeat(prevNumber || 1, () => {
          const startLine = this.state.getY();
          while (this.state.getCharacterUnderCursor() !== ' ' && this.state.getY() === startLine && !this.state.isEndOfFile()) {
            this.state.moveCursorForward();
          }
          if (this.state.getY() === startLine) {
            this.state.moveCursorForward();
          }
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'E':
      case 'e':
        repeat(prevNumber || 1, () => {
          this.state.moveCursorForward();
          const startLine = this.state.getY();
          const nextState = this.state.clone().moveCursorForward();
          while (nextState && nextState.getCharacterUnderCursor() !== ' ' && nextState.getY() === startLine) {
            this.state.moveCursorForward();
            if (nextState.isEndOfFile()) {
              break;
            }
            nextState.moveCursorForward();
          }
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case 'B':
      case 'b':
        repeat(prevNumber || 1, () => {
          const nextState = this.state.clone().moveCursorBackward();
          nextState.moveCursorBackward();
          const startLine = nextState.getY();
          while (nextState.getCharacterUnderCursor() !== ' ' && nextState.getY() === startLine && !this.state.isStartOfFile()) {
            this.state.moveCursorBackward();
            nextState.moveCursorBackward();
          }
          this.state.moveCursorBackward();
        });
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
      case '0':
        this.state.setX(0);
        this.keyBufferPop(1);
        return;
      case '^':
        this.state.setX(0);
        while (this.state.getCharacterUnderCursor() === ' ' && !this.state.isEndOfLine()) {
          this.state.moveCursorForward();
        }
        this.keyBufferPop(1);
        return;
      case '$':
        if (prevNumber) {
          this.state.setY(y => y + prevNumber - 1);
        }
        this.state.setX(this.file.lineLength(this.state.getY()) - 1);
        this.keyBufferPop(prevNumber !== undefined ? 2 : 1);
        return;
    }

    switch (lastKey.prevKey?.key) {
      case 'f':
        const char = lastKey.key;
        const nextState = this.state.clone();
        while (nextState.getCharacterUnderCursor() !== char && !nextState.isEndOfFile() && !nextState.isEndOfLine()) {
          nextState.moveCursorForward();
        }
        if (nextState.getCharacterUnderCursor() === char) {
          this.state.setX(nextState.getX());
        this.keyBufferPop(2);
        }
        return;
    }

    switch (lastKey.prevKey?.key) {
      case 't':
        const char = lastKey.key;
        const nextState = this.state.clone();
        while (nextState.getCharacterUnderCursor() !== char && !nextState.isEndOfFile() && !nextState.isEndOfLine()) {
          nextState.moveCursorForward();
        }
        if (nextState.getCharacterUnderCursor() === char) {
          this.state.setX(x => Math.max(x, nextState.getX() - 1));
          this.keyBufferPop(2);
        }
        return;
    }

  }

  normalReducer(lastKey: KeyEvent) {
    const count = lastKey.prevKey?.number || 1;

    if (lastKey.key === 'i' || lastKey.key === 'I') {
      this.mutateState(s => {
        if (lastKey.shiftKey) {
          s.setX(0);
        }
      })
      this.mode = Mode.Insert;
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'a' || lastKey.key === 'A') {
      this.mode = Mode.Insert;
      this.mutateState(s => {
        if (lastKey.shiftKey) {
          s.setX(this.currentLineLength());
        } else {
          s.moveCursorForward();
        }
      })
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'v' && lastKey.ctrlKey) {
      this.visualSelectionStartState = this.state.clone();
      this.mode = Mode.VisualBlock;
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'V') {
      this.visualSelectionStartState = this.state.clone();
      this.mode = Mode.VisualLine;
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'v') {
      this.visualSelectionStartState = this.state.clone();
      this.mode = Mode.Visual;
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'x') {
      this.mutateState(s => {
        repeat(count, () => {
          s.deleteTextAtCursor()
        });
        return s;
      })
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'd' && lastKey.prevKey?.key === 'd') {
      const count = lastKey.prevKey.prevKey?.number || 1;
      this.mutateState(s => {
        repeat(count, (i) => {
          s.file.deleteLine(s.getY()+i);
        });
        s.file.cleanup();
        return s;
      });
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'u') {
      repeat(count, () => {
        this.state = this.state.prevState || this.state;
      });
      delete this.keyBuffer;
      return;
    }

    if (lastKey.key === 'r' && lastKey.ctrlKey) {
      repeat(count, () => {
        this.state = this.state.nextState || this.state;
      });
      delete this.keyBuffer;
      return;
    }

    const x1 = this.state.getX();
    const y1 = this.state.getY();

    this.motionReducer(lastKey);

    const x2 = this.state.getX();
    const y2 = this.state.getY();

    if (x1 !== x2 || y1 !== y2) {
      switch (this.keyBuffer?.key) {
        case 'd':
          this.mutateState(s => {
            s.file.deleteSelection({
              x1,
              y1,
              x2,
              y2,
            })
            return s;
          });
          delete this.keyBuffer;
          return;
      }
    }
  }

  insertReducer(lastKey: KeyEvent) {
    switch (lastKey.key) {
      case 'Tab':
        this.state.insertTextAtCursor('  ');
        delete this.keyBuffer;
        break;
      case 'ArrowLeft':
        this.state.moveCursorBackward();
        delete this.keyBuffer;
        break;
      case 'ArrowRight':
        this.state.moveCursorForward();
        delete this.keyBuffer;
        break;
      case 'Backspace':
        this.state.deleteTextAtCursor();
        delete this.keyBuffer;
        break;
      case 'Enter':
        this.state.file.insertLine(this.state.getY() + 1);
        this.state.setY(y => y + 1);
        delete this.keyBuffer;
        break;
      default:
        this.state.insertTextAtCursor(lastKey.key);
        delete this.keyBuffer;
        break;
    }
    delete this.keyBuffer;
  }

  visualReducer(lastKey: KeyEvent) {
    const highlights = this.getHighlighted();

    if (!highlights) {
      return
    }

    this.motionReducer(lastKey);

    switch (lastKey.key) {
      case 'x':
      case 'd':
        this.mutateState(s => {
          for (const highlight of highlights) {
            s.file.deleteSelection(
              highlight,
              this.mode === Mode.VisualLine
            )
          }
          if (this.mode === Mode.Visual && highlights.length > 1) {
            const yMin = Math.min(...highlights.map(h => h.y1));
            s.file.mergeLines(yMin, yMin + 1)
          }
          s.file.cleanup();
          s.setY(y => y);
        });
        this.mode = Mode.Normal;
        break;
    }
  }

  notifyStateChange() {
    this.stateChangeListener?.();
  }

  getMode() {
    return this.mode;
  }

  getHighlighted(): HighlightSelection[] | undefined {
    const startState = this.visualSelectionStartState;

    if (!startState) {
      return undefined;
    }

    const y1 = Math.min(startState.getY(), this.state.getY());
    const y2 = Math.max(startState.getY(), this.state.getY());

    if (this.mode === Mode.VisualBlock) {
      const x1 = Math.min(startState.getX(), this.state.getX());
      const x2 = Math.max(startState.getX(), this.state.getX());
      return [
        { x1, x2, y1, y2 }
      ]
    } 
    if (this.mode === Mode.VisualLine) {
      const output: { x1: number, x2: number, y1: number, y2: number }[] = [];
      for (let y = y1; y <= y2; y++) {
        output.push({
          x1: 0,
          x2: this.file.lineLength(y) - 1,
          y1: y,
          y2: y,
        })
      }
      return output;
    }
    if (this.mode === Mode.Visual) {
      const output: { x1: number, x2: number, y1: number, y2: number }[] = [];
      for (let y = y1; y <= y2; y++) {
        output.push({
          x1: 0,
          x2: this.file.lineLength(y) - 1,
          y1: y,
          y2: y,
        })
      }
      output[0].x1 = startState.getX();
      output[output.length - 1].x2 = this.state.getX();
      return output;
    }

    return undefined;
  }
}
