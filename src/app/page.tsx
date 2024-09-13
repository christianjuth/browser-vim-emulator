"use client";

import { Mode } from '@/lib/vim/vim';
import { useVim } from "@/lib/vim/hooks";

const INIT_FILE = 
`# Welcome to Vim!
# This is an example file to get you started with Vim.
# You can start typing text here and save the file by pressing :w and then Enter.
# You can exit Vim by pressing :q and then Enter.
# You can also save and exit by pressing :wq and then Enter.
# You can also exit without saving by pressing :q! and then Enter.
# You can also undo by pressing u.
# You can also redo by pressing Ctrl-r.
# You can also copy by pressing y.
# You can also paste by pressing p.
# You can also cut by pressing d.`

function Cursor(props: { x: number, y: number }) {
  return (
    <div 
      className="h-[1em] w-[1ch] bg-foreground/90 absolute" 
      style={{
        top: `${props.y}em`,
        left: `${props.x}ch`,
      }}
    />
  );
}

function Highlight(props: { x1: number, y1: number, x2: number, y2: number }) {
  return (
    <div 
      className="bg-foreground/50 absolute" 
      style={{
        top: `${props.y1}em`,
        left: `${props.x1}ch`,
        width: `${(props.x2 - props.x1 + 1)}ch`,
        height: `${(props.y2 - props.y1 + 1)}em`,
      }}
    />
  );
}

export default function Home() {
  const vim = useVim(INIT_FILE);

  const lines = vim.getLines();

  const pos = vim.getCursorPos();
  
  const mode = vim.getMode();

  const highlights = vim.getHighlighted();

  return (
    <div className="h-[100svh] py-10">
      <div className="h-full flex flex-col justify-between max-w-4xl mx-auto border bg-card">
        <div className="grid grid-cols-[min-content,1fr] leading-[1em] gap-x-2 font-mono p-3 overflow-hidden">
          <div>
            {lines.map((_, i) => (
              <div className="text-right text-muted-foreground" key={i}>{i + 1}</div>
            ))}
          </div>

          <div className="relative">
            <pre>
              {vim.toString()}
            </pre>

            <Cursor x={pos.x} y={pos.y} />

            {highlights?.map((highlight, i) => (
              <Highlight {...highlight} key={i} />
            ))}
          </div>

        </div>

        <div className="p-3 flex flex-row justify-between text-xs items-center font-mono">
          <div>
            {mode === Mode.Normal ? "" : `-- ${mode.toUpperCase()} --`} 
          </div>

          <div className="bg-foreground/75 text-background px-2 leading-tight min-w-14 flex flex-row">
            <span className="flex-1 text-right">{pos.y+1}</span>:<span className="flex-1">{pos.x+1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
