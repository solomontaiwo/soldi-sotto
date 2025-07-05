import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Creazione del contesto per il tema
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Imposta le CSS variables dinamicamente
const setCSSVariables = (isDark) => {
  const root = document.documentElement;
  
  if (isDark) {
    // Dark theme variables
    root.style.setProperty('--background-primary', '#0f172a');
    root.style.setProperty('--background-secondary', '#1e293b');
    root.style.setProperty('--surface-primary', '#334155');
    root.style.setProperty('--surface-secondary', '#475569');
    root.style.setProperty('--text-primary', '#f8fafc');
    root.style.setProperty('--text-secondary', '#cbd5e1');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--border-primary', '#475569');
    root.style.setProperty('--border-secondary', '#64748b');
    root.style.setProperty('--glass-bg', 'rgba(51, 65, 85, 0.8)');
    root.style.setProperty('--glass-border', 'rgba(148, 163, 184, 0.2)');
    
    // Semantic colors (darker variants for dark theme)
    root.style.setProperty('--accent-success', '#10b981');
    root.style.setProperty('--accent-error', '#ef4444');
    root.style.setProperty('--accent-warning', '#f59e0b');
    root.style.setProperty('--accent-info', '#3b82f6');
    
    // Pastel colors (more subtle for dark theme)
    root.style.setProperty('--pastel-mint', 'rgba(16, 185, 129, 0.15)');
    root.style.setProperty('--pastel-coral', 'rgba(239, 68, 68, 0.15)');
    root.style.setProperty('--pastel-cream', 'rgba(245, 158, 11, 0.15)');
    root.style.setProperty('--pastel-sky', 'rgba(59, 130, 246, 0.15)');
    root.style.setProperty('--pastel-lavender', 'rgba(139, 92, 246, 0.15)');
    root.style.setProperty('--pastel-rose', 'rgba(236, 72, 153, 0.15)');
    
    // Gradients for dark theme
    root.style.setProperty('--gradient-soft-blue', 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.08) 100%)');
    root.style.setProperty('--gradient-soft-purple', 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(196, 181, 253, 0.08) 100%)');
    
    // Primary colors for dark theme  
    root.style.setProperty('--primary-400', '#60a5fa');
    root.style.setProperty('--primary-500', '#3b82f6');
    root.style.setProperty('--primary-600', '#2563eb');
    
    // Update meta theme color
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0f172a");
  } else {
    // Light theme variables  
    root.style.setProperty('--background-primary', '#f8fafc');
    root.style.setProperty('--background-secondary', '#f1f5f9');
    root.style.setProperty('--surface-primary', '#ffffff');
    root.style.setProperty('--surface-secondary', '#f8fafc');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#334155');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border-primary', '#e2e8f0');
    root.style.setProperty('--border-secondary', '#cbd5e1');
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--glass-border', 'rgba(148, 163, 184, 0.2)');
    
    // Semantic colors (same as original)
    root.style.setProperty('--accent-success', '#10b981');
    root.style.setProperty('--accent-error', '#ef4444');
    root.style.setProperty('--accent-warning', '#f59e0b');
    root.style.setProperty('--accent-info', '#3b82f6');
    
    // Pastel colors (original values)
    root.style.setProperty('--pastel-mint', 'rgba(16, 185, 129, 0.1)');
    root.style.setProperty('--pastel-coral', 'rgba(239, 68, 68, 0.1)');
    root.style.setProperty('--pastel-cream', 'rgba(245, 158, 11, 0.1)');
    root.style.setProperty('--pastel-sky', 'rgba(59, 130, 246, 0.1)');
    root.style.setProperty('--pastel-lavender', 'rgba(139, 92, 246, 0.1)');
    root.style.setProperty('--pastel-rose', 'rgba(236, 72, 153, 0.1)');
    
    // Gradients (original values)
    root.style.setProperty('--gradient-soft-blue', 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)');
    root.style.setProperty('--gradient-soft-purple', 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(196, 181, 253, 0.05) 100%)');
    
    // Primary colors for light theme
    root.style.setProperty('--primary-400', '#60a5fa');
    root.style.setProperty('--primary-500', '#3b82f6');
    root.style.setProperty('--primary-600', '#2563eb');
    
    // Update meta theme color
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#f8fafc");
  }
  
  // Update body classes
  document.body.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('light-theme', !isDark);
  document.documentElement.classList.toggle('dark-theme', isDark);
  document.documentElement.classList.toggle('light-theme', !isDark);
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
