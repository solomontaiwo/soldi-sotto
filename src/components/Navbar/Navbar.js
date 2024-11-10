import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Layout, Menu, Button, message } from "antd";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "../../ThemeContext";
import {
  FiLogOut,
  FiUserPlus,
  FiHome,
  FiList,
  FiPieChart,
  FiSun,
  FiMoon
} from "react-icons/fi";

const { Header } = Layout;

const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const isMobile = useMediaQuery({ maxWidth: 768 });
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
      backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
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
        theme={theme === "dark" ? "dark" : "light"}
        selectedKeys={[activeTab]}
        onClick={(e) => setActiveTab(e.key)}
        style={{
          backgroundColor: "transparent",
          color: theme === "dark" ? "#ffffff" : "#000000",
          borderBottom: "none",
          flexGrow: 1,
          justifyContent: "left",
        }}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path} style={{ color: theme === "dark" ? "#ffffff" : "#000000", fontSize: "16px" }}>
              {!isMobile && item.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Button
          onClick={toggleTheme}
          icon={theme === "dark" ? <FiSun /> : <FiMoon />}
          shape="circle"
          type="text"
          style={{
            color: theme === "dark" ? "#ffffff" : "#000000",
            fontSize: "20px"
          }}
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
          <Button type="primary" icon={<FiUserPlus />}>
            <Link to="/register" style={{ color: "white" }}>{!isMobile && "Registrati"}</Link>
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
