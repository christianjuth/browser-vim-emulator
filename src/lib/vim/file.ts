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

  deleteSelection(start: { x: number, y: number }, end: { x: number, y: number }, removeEmptyLines = false) {
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);

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

  cleanup() {
    this.lines = this.lines.filter(Boolean);
  }
  
  getSelection(start: { x: number, y: number }, end: { x: number, y: number }) {
    let y = 0
    const selection = []
    for (const line of this.lines) {
      if (line !== null && y >= start.y && y <= end.y) {
        selection.push(line.slice(start.x, end.x + 1))
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
}

