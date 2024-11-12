import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { theme } from "antd";

// Creazione del contesto per il tema
const ThemeContext = createContext();

// Hook personalizzato per accedere al contesto del tema
export const useTheme = () => useContext(ThemeContext);

// Componente principale per il tema
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light"); // Stato per gestire il tema chiaro/scuro

  // Funzione per cambiare il tema
  const toggleTheme = () => {
    setThemeMode((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Effetto per gestire il salvataggio e il recupero del tema dal localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
    document.body.classList.toggle("dark-theme", themeMode === "dark");
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      {/* ConfigProvider di Ant Design per applicare il tema */}
      <ConfigProvider
        theme={{
          algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: themeMode === "dark" ? "#3b82f6" : "#007bff",
          },
        }}
      >
        <div style={{ padding: "10px" }}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};