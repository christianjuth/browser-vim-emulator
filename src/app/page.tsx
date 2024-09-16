"use client";

import { useVim } from "@/lib/vim-react/hooks";
import { 
  Vim, 
  VimLineNumbers, 
  VimEditor, 
  VimCursor,
  VimHighlights,
  VimStatusBar,
} from '@/lib/vim-react';

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
    <div className="h-[100svh] py-10">
      <Vim 
        vim={vim}
        className="h-full flex flex-col justify-between max-w-4xl mx-auto bg-card border font-mono p-4"
        keyListener="global"
      >
        <div className="flex flex-row">
          <VimLineNumbers className="min-w-9 mr-2 text-muted-foreground" />
          <VimEditor>
            <VimCursor className="bg-foreground/80" /> 
            <VimHighlights className="bg-foreground/50" />
          </VimEditor>
        </div>

        <VimStatusBar className="text-xs" />
      </Vim>
    </div>
  );
}
