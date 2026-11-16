import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "theme";
const DEFAULT_THEME = "dark";
const ThemeContext = createContext(null);

const readSavedTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readSavedTheme() || DEFAULT_THEME);

  // Apply to <html> and remember the choice whenever it changes.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
