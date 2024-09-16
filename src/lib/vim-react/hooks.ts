import { Vim } from "../vim/Vim";
import {  useRef, useState } from "react";

export function useVim(initFile: string) {
  const [, setSignal] = useState(0);

  const vim = useRef(new Vim({
    file: initFile,
    onStateChange: () => setSignal(s => s + 1)
  }));

  return vim.current;
}
