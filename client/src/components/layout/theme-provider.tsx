import { createContext, useContext, useEffect, useState } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  forcedTheme?: string;
}

interface ThemeProviderState {
  theme: string;
  setTheme: (theme: string) => void;
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(() => {
    if (forcedTheme) return forcedTheme;
    
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme) return storedTheme;
      
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : defaultTheme;
    }

    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (forcedTheme) {
      root.classList.add(forcedTheme);
      return;
    }
    
    root.classList.add(theme);
  }, [theme, forcedTheme]);

  useEffect(() => {
    if (forcedTheme) return;
    
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, forcedTheme]);

  const value = {
    theme,
    setTheme: (newTheme: string) => {
      if (forcedTheme) return;
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
