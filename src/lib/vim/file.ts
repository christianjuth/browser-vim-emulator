export class File {
  private lines: string[];

  constructor(file: string | string[]) {
    this.lines = typeof file === 'string' ? file.split('\n') : file.slice();
  }

  lineCount() {
    return this.lines.length;
  }

  lineLength(y: number) {
    return this.getLine(y).length;
  }

  deleteSelection(start: { x: number, y: number }, end: { x: number, y: number }) {
    let y = 0
    for (const line of this.lines) {
      if (y >= start.y && y <= end.y) {
        this.lines[y] = line.slice(0, start.x) + line.slice(end.x + 1)
      }
      y++ 
    }
  }
  
  getSelection(start: { x: number, y: number }, end: { x: number, y: number }) {
    let y = 0
    const selection = []
    for (const line of this.lines) {
      if (y >= start.y && y <= end.y) {
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
    return new File(this.lines);
  }

  getLine(y: number) {
    return this.lines[y];
  }

  getLines() {
    return this.lines.slice();
  }
}

