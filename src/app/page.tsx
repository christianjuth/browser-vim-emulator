"use client";

import { useVim } from "@/lib/vim/hooks";
import { Fragment } from "react";

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

export default function Home() {
  const vim = useVim(INIT_FILE);

  const lines = vim.getLines();

  const pos = vim.getCursorPos();

  return (
    <div className="h-[100svh] py-10">
      <div className="h-full flex flex-col justify-between max-w-4xl mx-auto border bg-card">
        <div className="grid grid-cols-[min-content,1fr] leading-[1em] gap-x-2 font-mono p-3 overflow-hidden">
          {lines.map((line, i) => (
            <Fragment key={line}>
              <div className="text-right text-muted-foreground">{i + 1}</div>
              <pre style={{ gridRowStart: i+1 }} className="col-start-2">
                {line}
              </pre>
            </Fragment>
          ))}

          <div className="col-start-2 row-start-1 relative">
            <div 
              className="h-[1em] w-[1ch] bg-foreground/90 absolute" 
              style={{
                top: `${vim.getCursorPos().y}em`,
                left: `${vim.getCursorPos().x}ch`,
              }}
            />
          </div>
        </div>

        <div className="p-3 flex flex-row justify-between text-sm">
          <div/>

          <div className="bg-foreground/75 text-background px-2 leading-tight min-w-14 flex flex-row">
            <span className="flex-1 text-right">{pos.y+1}</span>:<span className="flex-1">{pos.x+1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
