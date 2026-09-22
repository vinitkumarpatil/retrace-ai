'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CursorVariant = 'default' | 'button' | 'card' | 'explore' | 'demo' | 'text';

interface CursorContextType {
  cursorText: string;
  cursorVariant: CursorVariant;
  setCursorText: (text: string) => void;
  setCursorVariant: (variant: CursorVariant) => void;
  setCursor: (text: string, variant?: CursorVariant) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorText, setCursorText] = useState<string>('');
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');

  const setCursor = (text: string, variant: CursorVariant = 'button') => {
    setCursorText(text);
    setCursorVariant(variant);
  };

  const resetCursor = () => {
    setCursorText('');
    setCursorVariant('default');
  };

  return (
    <CursorContext.Provider
      value={{
        cursorText,
        cursorVariant,
        setCursorText,
        setCursorVariant,
        setCursor,
        resetCursor,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
}
