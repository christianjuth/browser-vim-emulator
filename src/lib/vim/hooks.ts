import { Vim } from "./vim";
import { useEffect, useRef, useState } from "react";

export function useVim(initFile: string) {
  const [_, setSignal] = useState(0);

  const vim = useRef(new Vim({
    file: initFile,
    onStateChange: () => setSignal(s => s + 1)
  }));

  useEffect(() => {
    const cleanup = vim.current.registerKeyListeners();
    return cleanup;
  }, []);

  return vim.current;
}
