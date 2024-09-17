function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export class File {
  private lines: (string | null)[];

  constructor(file: string | string[]) {
    this.lines = typeof file === 'string' ? file.split('\n') : file.slice();
  }

  lineCount() {
    return this.lines.length;
  }

  lineLength(y: number) {
    return this.getLine(y)?.length ?? 0;
  }

  deleteSelection(
    coords: { x1: number, y1: number, x2: number, y2: number }, 
    removeEmptyLines = false
  ) {
    const minY = Math.min(coords.y1, coords.y2);
    const maxY = Math.max(coords.y1, coords.y2);
    const minX = Math.min(coords.x1, coords.x2);
    const maxX = Math.max(coords.x1, coords.x2);

    let y = 0
    for (const line of this.lines) {
      if (line === null) {
        y++
        continue;
      }

      if (y >= minY && y <= maxY) {
        if (minX === 0 && maxX === line.length - 1 && removeEmptyLines) {
          this.lines[y] = null;
        } else {
          this.lines[y] = line.slice(0, minX) + line.slice(maxX + 1)
        }
      }
      y++ 
    }
  }

  deleteLine(y: number) {
    this.lines[y] = null;
  }

  cleanup() {
    this.lines = this.lines.filter(l => l !== null);
    if (this.lines.length === 0) {
      this.lines.push("");
    }
  }
  
  getSelection(coords: { x1: number, y1: number, x2: number, y2: number }) {
    let y = 0
    const selection = []
    for (const line of this.lines) {
      if (line !== null && y >= coords.y1 && y <= coords.y2) {
        selection.push(line.slice(coords.x1, coords.x2 + 1))
      }
      y++ 
    }
    return selection.join('\n');
  }

  toString() {
    return this.lines.join('\n');
  }

  clone() {
    return new File(this.lines.filter(isNotNull));
  }

  getLine(y: number) {
    return this.lines[y];
  }

  getLines() {
    return this.lines.slice().filter(isNotNull);
  }

  mergeLines(a: number, b: number) {
    this.lines[a] = (this.lines[a] ?? "") + (this.lines[b] ?? "");
    this.lines[b] = null;
  }

  insertText(text: string, x: number, y: number) {
    const line = this.lines[y];
    if (!line) {
      this.lines[y] = text;
    } else {
      this.lines[y] = line.slice(0, x) + text + line.slice(x);
    }
  }

  insertLine(y: number, text = "") {
    this.lines.splice(y, 0, text);
  }
}

