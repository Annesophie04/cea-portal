import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext';

const STORAGE_KEY = 'cea-theme';

function getPreferredDark() {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [dark, setDarkState] = useState(() => getPreferredDark());

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', dark ? '#06060e' : '#102a43');
    }
  }, [dark]);

  const toggle = useCallback(() => setDarkState((d) => !d), []);
  const setDark = useCallback((value) => setDarkState(Boolean(value)), []);

  const value = useMemo(() => ({ dark, toggle, setDark }), [dark, toggle, setDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
