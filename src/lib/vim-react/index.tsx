import { Mode } from '@/lib/vim/Vim';
import { useVim } from './hooks'
import { createContext, useContext, useEffect, useRef } from 'react'
import { createKeybardEventListener } from '../vim/KeyEvent';

function assertVim(
  componentName: string, 
  vim?: ReturnType<typeof useVim>
): asserts vim is ReturnType<typeof useVim> {
  if (!vim) {
    throw new Error(`useVim must be used within a ${componentName}`);
  }
}

const Context = createContext<{
  vim?: ReturnType<typeof useVim>
}>({});

export function VimCursor({
  className
}: {
  className?: string
}) {
  const vim = useContext(Context).vim;
  assertVim("VimCursor", vim);
  const pos = vim.getCursorPos();
  const isInsert = vim.getMode() === Mode.Insert;
  const left = pos.x;
  return (
    <div 
      className={className}
      style={{
        top: `${pos.y}em`,
        left: Math.max(0, left) + "ch",
        height: '1em',
        width: isInsert ? 1 : '1ch',
        position: 'absolute',
      }}
    />
  );
}

function Highlight({
  position,
  className,
}: {
  position: {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  }
  className?: string
}) {
  return (
    <div 
      className={className}
      style={{
        top: `${position.y1}em`,
        left: `${position.x1}ch`,
        width: `${(position.x2 - position.x1 + 1)}ch`,
        height: `${(position.y2 - position.y1 + 1)}em`,
        position: 'absolute',
      }}
    />
  );
}
export function VimHighlights({
  className
}: {
  className?: string
}) {
  const vim = useContext(Context).vim;
  assertVim("VimHighlights", vim);
  const highlights = vim.getHighlighted();
  return (
    <>
      {highlights?.map((highlight, i) => (
        <Highlight 
          key={i} 
          position={highlight}
          className={className}
        />
      ))} 
    </>
  )
}

export function VimLineNumbers({
  className
}: {
  className?: string
}) {
  const vim = useContext(Context).vim;
  assertVim("VimLineNumbers", vim);
  const lines = vim.getLines();
  return (
    <div className={className} style={{ lineHeight: '1em' }}>
      {lines.map((_, i) => (
        <div style={{ textAlign: 'right' }} key={i}>{i + 1}</div>
      ))}
    </div>
  )
}

export function VimEditor({
  children
}: {
  children?: React.ReactNode
}) {
  const vim = useContext(Context).vim;
  assertVim("VimEditor", vim);
  return (
    <div 
      style={{
        position: 'relative',
      }}
    >
      <pre style={{ lineHeight: '1em' }}>
        {vim.toString()}
      </pre>

      {children}
    </div>
  )
}

export function Vim({
  vim,
  children,
  className,
  keyListener,
}: {
  vim: ReturnType<typeof useVim>
  children?: React.ReactNode
  className?: string
  keyListener: 'global' | 'local'
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = keyListener === 'local' ? ref.current : document.body;
    if (!target) return;

    const listener = createKeybardEventListener(vim);
    target.addEventListener('keydown', listener);
    return () => {
      target.removeEventListener('keydown', listener);
    }
  }, [vim]);

  return (
    <Context.Provider value={{ vim }}>
      <div 
        className={className}
        ref={ref}
        tabIndex={keyListener === 'local' ? 0 : undefined}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function VimStatusBar({
  className,
}: {
  className?: string
}) {
  const vim = useContext(Context).vim;
  assertVim("VimStatusBar", vim);
  const mode = vim.getMode();
  const pos = vim.getCursorPos();
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        {mode === Mode.Normal ? "" : `-- ${mode.toUpperCase()} --`} 
      </div>

      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          minWidth: '8ch',
        }}
      >
        <span style={{ textAlign: 'right', flex: 1 }}>{pos.y+1}</span>
        :
        <span style={{ flex: 1 }}>{pos.x+1}</span>
      </div>
    </div>
  )
}
