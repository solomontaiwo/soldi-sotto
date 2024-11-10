import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Layout, Menu, Button, message, Switch } from "antd";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "../../ThemeContext";  // Importa useTheme dal ThemeContext
import {
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiHome,
  FiList,
  FiPieChart,
} from "react-icons/fi";

const { Header } = Layout;

const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  // Rileva se lo schermo è di tipo mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Usa il contesto del tema
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success("Logout effettuato con successo!");
    } catch (error) {
      console.error("Error signing out: ", error);
      message.error("Errore durante il logout.");
    }
  };

  const menuItems = [
    { key: "/", label: "Home", icon: <FiHome />, path: "/" },
    { key: "/transactions", label: "Transazioni", icon: <FiList />, path: "/transactions" },
    { key: "/stats", label: "Statistiche", icon: <FiPieChart />, path: "/stats" },
  ];

  return (
    <Header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",  // Cambia colore in base al tema
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    }}>
      <Link to="/" style={{ marginRight: 20, display: "flex", alignItems: "center" }}>
        <img
          src={`${process.env.PUBLIC_URL}/icon.png`}
          alt="Logo"
          style={{ height: 40 }}
        />
      </Link>

      <Menu
        mode="horizontal"
        theme={theme === "dark" ? "dark" : "light"}  // Cambia il tema del menu
        selectedKeys={[activeTab]}
        onClick={(e) => setActiveTab(e.key)}
        style={{
          backgroundColor: "transparent",
          color: theme === "dark" ? "#ffffff" : "#000000",  // Colore in base al tema
          borderBottom: "none",
          flexGrow: 1,
          justifyContent: isMobile ? "left" : "left",
        }}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path} style={{ color: theme === "dark" ? "#ffffff" : "#000000", fontSize: "16px" }}>
              {!isMobile && item.label} {/* Nasconde il testo su mobile */}
            </Link>
          </Menu.Item>
        ))}
      </Menu>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Switch
          checked={theme === "dark"}
          onChange={toggleTheme}
          checkedChildren="🌙"  // Icona luna per tema scuro
          unCheckedChildren="☀️"  // Icona sole per tema chiaro
        />

        {currentUser ? (
          <Button
            onClick={handleLogout}
            type="primary"
            icon={<FiLogOut />}
            style={{
              backgroundColor: "#f5222d",
              borderColor: "#f5222d",
              color: "white",
            }}
          >
            {!isMobile && "Logout"}
          </Button>
        ) : (
          <>
            <Button type="link" icon={<FiLogIn />} style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              <Link to="/login" style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>{!isMobile && "Login"}</Link>
            </Button>
            <Button type="primary" icon={<FiUserPlus />}>
              <Link to="/register" style={{ color: "white" }}>{!isMobile && "Registrati"}</Link>
            </Button>
          </>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
