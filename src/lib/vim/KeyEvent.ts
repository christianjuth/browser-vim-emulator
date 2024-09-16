import { Mode, type Vim } from './Vim';

export class KeyEvent {
  prevKey?: KeyEvent;

  number?: number;
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;

  constructor({
    key,
    ctrlKey,
    shiftKey,
  }: {
    key: string,
    ctrlKey?: boolean,
    shiftKey?: boolean
  }) {
    this.key = shiftKey ? key.toUpperCase() : key;
    if (key.match(/[0-9]/)) {
      this.number = parseInt(key);
    }
    this.ctrlKey = ctrlKey ?? false;
    this.shiftKey = shiftKey ?? false;
  }

  canBeCombined(other: KeyEvent) {
    return typeof this.number === 'number' && typeof other.number === 'number' && !this.ctrlKey && !this.shiftKey && !other.ctrlKey && !other.shiftKey;
  }

  combine(other: KeyEvent) {
    if (this.canBeCombined(other)) {
      this.key += other.key;
      this.number = parseInt(this.key);
    } else {
      throw new Error('Cannot combine key events');
    }
  }
}

const IGNORE_KEYS = [
  "Shift",
  "Alt",
  "Meta",
  "Control",
];

export function createKeybardEventListener(vim: Vim) {
  return (e: KeyboardEvent) => {
    // ignore shift, alt, and meta keys
    if (!IGNORE_KEYS.includes(e.key)) {
      if (vim.getMode() === Mode.Insert) {
        e.preventDefault();
      }
      vim.keyPress(new KeyEvent({
        key: e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
      }));
    }
  }
}
