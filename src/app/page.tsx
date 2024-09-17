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
`" Example Vim File for Supported Features

" Navigation (gg, G, h, j, k, l, 0, $)
The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog

" Deletion (x, dd, 2dd)
This line will be deleted with 'dd'
And this one with '2dd'

" Find/To (f, t)
Use 'f' to move to a character
Use 't' to move just before a character

" Visual Mode and Block Deletion
Select and delete parts of this sentence

" Insert Mode (i) and Backspace
You can insert text here and use Backspace to remove it`


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
