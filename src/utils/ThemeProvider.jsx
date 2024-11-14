import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { theme } from "antd";

// Creazione del contesto per il tema
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Funzione per impostare le variabili CSS globali e il colore della barra
const setCSSVariables = (themeMode) => {
  const root = document.documentElement;

  // Imposta le variabili CSS per i colori
  if (themeMode === "dark") {
    root.style.setProperty("--background-color", "#1f1f1f");
    root.style.setProperty("--text-color", "#e0e0e0");
    root.style.setProperty("--primary-color", "#1a73e8");
    root.style.setProperty("--card-background", "#33333385");
  } else {
    root.style.setProperty("--background-color", "#f0f0f0");
    root.style.setProperty("--text-color", "#333333");
    root.style.setProperty("--primary-color", "#007bff");
    root.style.setProperty("--card-background", "#ffffff");
  }

  // Aggiorna il meta tag `theme-color`
  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
  if (themeColorMetaTag) {
    themeColorMetaTag.content = themeMode === "dark" ? "#1f1f1f" : "#f0f0f0";
  }
};

// Componente principale per il tema
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");

  const applySystemTheme = () => {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const themeToApply = systemPrefersDark ? "dark" : "light";
    setThemeMode(themeToApply);
    setCSSVariables(themeToApply);
  };

  const toggleTheme = (mode) => {
    if (mode === "system") {
      applySystemTheme();
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", applySystemTheme);
    } else {
      setThemeMode(mode);
      setCSSVariables(mode);
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", applySystemTheme);
    }
    localStorage.setItem("theme", mode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "system" || !savedTheme) {
      applySystemTheme();
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", applySystemTheme);
    } else {
      setThemeMode(savedTheme);
      setCSSVariables(savedTheme);
    }
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", applySystemTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm:
            themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
