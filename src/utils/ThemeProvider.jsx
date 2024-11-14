import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { theme } from "antd";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const setCSSVariables = (themeMode) => {
  const root = document.documentElement;
  if (themeMode === "dark") {
    root.style.setProperty("--background-color", "#1f1f1f");
    root.style.setProperty("--text-color", "#e0e0e0");
    root.style.setProperty("--primary-color", "#1a73e8");
    root.style.setProperty("--secondary-color", "#255adb");
    root.style.setProperty("--card-background", "#33333385");
    root.style.setProperty("--shadow-color", "rgba(255, 255, 255, 0.1)");
    root.style.setProperty("--button-bg-color", "#3b83f6");
  } else {
    root.style.setProperty("--background-color", "#f0f0f0");
    root.style.setProperty("--text-color", "#333333");
    root.style.setProperty("--primary-color", "#007bff");
    root.style.setProperty("--secondary-color", "#0056b3");
    root.style.setProperty("--card-background", "#ffffff");
    root.style.setProperty("--shadow-color", "rgba(0, 0, 0, 0.1)");
    root.style.setProperty("--button-bg-color", "#007bff");
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(null);

  const applySystemTheme = () => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeMode(systemPrefersDark ? "dark" : "light");
    setCSSVariables(systemPrefersDark ? "dark" : "light");
  };

  const toggleTheme = (mode) => {
    if (mode === "system") {
      applySystemTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);
    } else {
      setThemeMode(mode);
      setCSSVariables(mode);
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", applySystemTheme);
    }
    localStorage.setItem("theme", mode);
  };

  useEffect(() => {
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute("content", themeMode === "dark" ? "#1f1f1f" : "#ffffff");
    }
  }, [themeMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "system" || !savedTheme) {
      applySystemTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);
    } else {
      setThemeMode(savedTheme);
      setCSSVariables(savedTheme);
    }
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", applySystemTheme);
    };
  }, []);

  if (themeMode === null) {
    return null; // Rendi nulla la UI finché non è determinato il tema
  }

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
