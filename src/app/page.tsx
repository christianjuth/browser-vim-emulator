"use client";

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

export default function Home() {
  const vim = useVim(INIT_FILE);

  return (
    <div className="relative font-mono">
      <pre className="leading-[1em]">
        {vim.toString()}
      </pre>
      <div 
        className="h-[1em] w-[1ch] bg-white absolute" 
        style={{
          top: `${vim.getCursorPos().y}em`,
          left: `${vim.getCursorPos().x}ch`,
        }}
      />
    </div>
  );
}
