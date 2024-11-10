// ThemeSwitcher.js
import React from "react";
import { Switch } from "antd";
import { useTheme } from "./ThemeContext";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>🌞</span>
      <Switch
        checked={theme === "dark"}
        onChange={toggleTheme}
        checkedChildren="🌜"
        unCheckedChildren="🌞"
      />
    </div>
  );
};

export default ThemeSwitcher;
