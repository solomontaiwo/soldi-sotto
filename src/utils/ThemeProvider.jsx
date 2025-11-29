import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Creazione del contesto per il tema
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Toggles the theme class for Tailwind (dark mode)
const setCSSVariables = (isDark) => {
  document.documentElement.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  document.body.classList.toggle("light", !isDark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#0f172a" : "#f8fafc");
};

// Componente principale per il tema
export const ThemeProvider = ({ children }) => {
  ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  const getSystemPreference = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const applyTheme = (themeMode) => {
    let isDark;
    
    if (themeMode === "system") {
      isDark = getSystemPreference();
    } else {
      isDark = themeMode === "dark";
    }
    
    setCSSVariables(isDark);
    return isDark;
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const getCurrentEffectiveTheme = () => {
    if (theme === "system") {
      return getSystemPreference() ? "dark" : "light";
    }
    return theme;
  };

  useEffect(() => {
    // Applica il tema iniziale
    applyTheme(theme);

    // Ascolta i cambiamenti delle preferenze di sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      currentEffectiveTheme: getCurrentEffectiveTheme(),
      isDarkMode: getCurrentEffectiveTheme() === "dark"
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
