import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

const STORAGE_KEY = "jules-theme";
const THEME_COLORS = { light: "#f8f9f7", dark: "#101312" }; // matches --canvas

const isTheme = (value) => value === "light" || value === "dark";

const readStoredTheme = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : null;
  } catch {
    return null;
  }
};

const writeStoredTheme = (theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still works for this session.
  }
};

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function ThemeProvider({ children }) {
  // `preference` is null until the user picks a theme, so we follow the OS until then.
  const [preference, setPreference] = useState(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState(() => (systemQuery().matches ? "dark" : "light"));
  const theme = preference ?? systemTheme;

  // Follow OS changes while the user hasn't chosen explicitly.
  useEffect(() => {
    const query = systemQuery();
    const onChange = (event) => setSystemTheme(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setPreference(isTheme(event.newValue) ? event.newValue : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setPreference(next);
    writeStoredTheme(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}