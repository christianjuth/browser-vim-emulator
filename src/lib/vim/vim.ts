import { File } from "./file"

export enum SpecialKeys {
  Ctrl = 'Ctrl-',
  Shift = 'Shift',
  Alt = 'Alt',
  Meta = 'Meta',
}

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

class State {
  readonly file: File;
  x: number = 0;
  y: number = 0;
  prevState?: State;
  nextState?: State;
  constructor(file: File) {
    this.file = file;
  }
  clone() {
    const state = new State(this.file.clone());
    state.x = this.x;
    state.y = this.y;
    return state;
  }

  setX(x: number | ((x: number) => number)) {
    const xAsNumber = typeof x === 'function' ? x(this.x) : x;
    this.x = clamp(0, this.file.lineLength(this.y) - 1, xAsNumber);
  }

  getX() {
    return clamp(0, this.file.lineLength(this.y) - 1, this.x);
  }

  setY(y: number | ((y: number) => number)) {
    const yAsNumber = typeof y === 'function' ? y(this.y) : y;
    this.y = clamp(0, this.file.lineCount() - 1, yAsNumber);
  }

  getY() {
    return clamp(0, this.file.lineCount() - 1, this.y);
  }
}

const MOTIONS: {
  matcher: RegExp,
  handler: (state: State, match: RegExpMatchArray) => void
}[] = [
  {
    matcher: /([0-9]*)(h|j|k|l|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/,
    handler: (state: State, match: RegExpMatchArray) => {
      const count = parseInt(match[1] || '1');
      const motion = match[2];
      switch (motion) {
        case 'h':
        case 'ArrowLeft':
          state.setX(x => x - count);
          break;
        case 'j':
        case 'ArrowDown':
          state.setY(y => y + count);
          break;
        case 'k':
        case 'ArrowUp':
          state.setY(y => y - count);
          break;
        case 'l':
        case 'ArrowRight':
          state.setX(x => x + count);
          break;
      }
    }
  },
  {
    matcher: /([0-9]*)(gg|G)$/,
    handler: (state: State, match: RegExpMatchArray) => {
      const line = match[1] ? parseInt(match[1]) : undefined;
      if (line) {
        state.setY(line - 1);
      } else if (match[2] === 'gg') {
        state.setY(0);
      } else {
        state.setY(state.file.lineCount() - 1);
      }
    }
  },
  {
    matcher: /([0-9]*)(\$)$/,
    handler: (state: State, match: RegExpMatchArray) => {
      const count = match[1] ? parseInt(match[1]) : undefined;
      if (count) {
        state.setY(y => y + count - 1);
      }
      state.setX(state.file.lineLength(state.y) - 1);
    }
  },
  {
    matcher: /(?<![0-9])(0)$/,
    handler: (state: State) => {
      state.setX(0);
    }
  }
]

const ACTIONS: {
  matcher: RegExp,
  handler: (state: State, match: RegExpMatchArray) => State
}[] = [
  {
    matcher: /([0-9]*)(x)$/,
    handler: (state, match) => {
      const count = match[1] ? parseInt(match[1]) : 1;
      
      state.file.deleteSelection({
        x: state.getX(), 
        y: state.getY(),
      }, {
        x: state.getX() + count - 1, 
        y: state.getY(),
      })

      return state;
    }
  },
]

const HISTORY_ACTIONS: {
  matcher: RegExp,
  handler: (state: State, match: RegExpMatchArray) => State
}[] = [
  {
    matcher: /([0-9]*)(u)$/,
    handler: (state, match) => {
      const count = match[1] ? parseInt(match[1]) : 1;
      let newState = state;

      for (let i = 0; i < count; i++) {
        if (!newState.prevState) {
          break;
        }
        newState = newState.prevState;
      }

      return newState;
    }
  },
  {
    matcher: /([0-9]*)(Ctrl-r)$/,
    handler: (state, match) => {
      const count = match[1] ? parseInt(match[1]) : 1;
      let newState = state;

      for (let i = 0; i < count; i++) {
        if (!newState.nextState) {
          break;
        }
        newState = newState.nextState;
      }

      return newState;
    }
  }
]

export class Vim {
  keyBuffer = "";

  state: State

  stateChangeListener?: () => void;

  constructor({ 
    file, 
    onStateChange 
  }: { 
    file: string, 
    onStateChange?: () => void 
  }) {
    this.stateChangeListener = onStateChange;
    this.state = new State(new File(file));
  }

  currentLine() {
    return this.file.getLine(this.state.getY());
  }

  get file() {
    return this.state.file;
  }

  mutateState(mutator: (state: State) => State) {
    const newState = this.state.clone();
    newState.prevState = this.state;
    this.state.nextState = newState;
    this.state = mutator(newState);
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

  keyPress(key: string) {
    this.keyBuffer += key;
    if (this.keyBuffer.length >= 1) {
      this.processKeyBuffer();
    }
  }

  processKeyBuffer() {
    let foundMatch = false;

    if (/Excape$/.test(this.keyBuffer)) {
      this.keyBuffer = "";
      return
    }

    for (const motion of MOTIONS) {
      if (motion.matcher.test(this.keyBuffer)) {
        foundMatch = true;
        const match = this.keyBuffer.match(motion.matcher)!;
        const matchLength = match[0].length;
        motion.handler(this.state, match)
        this.keyBuffer = this.keyBuffer.slice(0, this.keyBuffer.length - matchLength);
      }
    }

    for (const action of ACTIONS) {
      if (action.matcher.test(this.keyBuffer)) {
        foundMatch = true;
        const match = this.keyBuffer.match(action.matcher)!;
        this.mutateState((state) => action.handler(state, match));
      }
    }

    if (!foundMatch) {
      for (const action of HISTORY_ACTIONS) {
        if (action.matcher.test(this.keyBuffer)) {
          foundMatch = true;
          const match = this.keyBuffer.match(action.matcher)!;
          this.state = action.handler(this.state, match);
        }
      }
    }

    if (foundMatch) {
      this.keyBuffer = "";
    }

    this.notifyStateChange();
  }

  registerKeyListeners() {
    const ignoreKeys = [
      "Shift",
      "Alt",
      "Meta",
      "Control",
    ]

    const keyListener = (e: KeyboardEvent) => {
      // ignore shift, alt, and meta keys
      if (!ignoreKeys.includes(e.key)) {
        let key = e.key;
        if (e.ctrlKey) {
          key = SpecialKeys.Ctrl + key;
        }
        this.keyPress(key);
      }
    }
    window.addEventListener('keydown', keyListener);
    return () => {
      window.removeEventListener('keydown', keyListener);
    }
  }


  notifyStateChange() {
    this.stateChangeListener?.();
  }
}
