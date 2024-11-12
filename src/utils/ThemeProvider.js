import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { theme } from "antd";

// Creazione del contesto per il tema
const ThemeContext = createContext();

// Hook personalizzato per accedere al contesto del tema
export const useTheme = () => useContext(ThemeContext);

// Componente principale per il tema
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");

  const applySystemTheme = () => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeMode(systemPrefersDark ? "dark" : "light");
    document.body.classList.toggle("dark-theme", systemPrefersDark);
  };

  const toggleTheme = (mode) => {
    if (mode === "system") {
      applySystemTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);
    } else {
      setThemeMode(mode);
      document.body.classList.toggle("dark-theme", mode === "dark");
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", applySystemTheme);
    }
    localStorage.setItem("theme", mode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "system") {
      applySystemTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);
    } else if (savedTheme) {
      setThemeMode(savedTheme);
      document.body.classList.toggle("dark-theme", savedTheme === "dark");
    }
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", applySystemTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: themeMode === "dark" ? "#3b82f6" : "#007bff",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
