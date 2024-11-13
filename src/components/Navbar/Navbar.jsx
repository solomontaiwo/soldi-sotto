import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { Layout, Menu, Button, Dropdown, message } from "antd";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "../../utils/ThemeProvider";
import { motion } from "framer-motion";
import {
  FiLogOut,
  FiUserPlus,
  FiHome,
  FiList,
  FiPieChart,
  FiSun,
  FiMoon,
  FiMonitor,
} from "react-icons/fi";

const { Header } = Layout;

const Navbar = () => {
  const { currentUser, loading: authLoading } = useAuth();
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

  // Menu items per desktop (icone + testo)
  const desktopMenuItems = [
    {
      key: "/",
      icon: <FiHome />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/transactions",
      icon: <FiList />,
      label: <Link to="/transactions">Transazioni</Link>,
    },
    {
      key: "/stats",
      icon: <FiPieChart />,
      label: <Link to="/stats">Statistiche</Link>,
    },
  ];

  // Menu items per mobile (solo icone)
  const mobileMenuItems = [
    {
      key: "/",
      icon: <Link to="/"><FiHome /></Link>,
    },
    {
      key: "/transactions",
      icon: <Link to="/transactions"><FiList /></Link>,
    },
    {
      key: "/stats",
      icon: <Link to="/stats"><FiPieChart /></Link>,
    },
  ];

  // Menu per il tema
  const themeMenuItems = [
    { key: "light", label: "Tema chiaro", icon: <FiSun /> },
    { key: "dark", label: "Tema scuro", icon: <FiMoon /> },
    { key: "system", label: "Tema di sistema", icon: <FiMonitor /> },
  ];

  return (
    <Header
      style={{
        display: "flex",
        padding: "0 20px",
        backgroundColor: "var(--background-color)",
        transition: "background-color 0.3s ease",
      }}
    >
      <Link to="/" style={{ marginRight: 20, display: "flex", alignItems: "center" }}>
        <img src="icon.png" alt="Logo" style={{ height: 40 }} />
      </Link>

      {/* Menu principale: scegli il menu in base a isMobile */}
      <Menu
        mode="horizontal"
        theme={theme === "dark" ? "dark" : "light"}
        onClick={(e) => setActiveTab(e.key)}
        style={{
          backgroundColor: "transparent",
          color: theme === "dark" ? "#ffffff" : "#000000",
          flexGrow: 1,
          display: "flex",
        }}
        items={isMobile ? mobileMenuItems : desktopMenuItems}
      />

      {!authLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {/* Dropdown per il cambio tema */}
          <Dropdown
            menu={{
              items: themeMenuItems,
              onClick: ({ key }) => toggleTheme(key),
            }}
            trigger={["click"]}
          >
            <Button
              icon={theme === "dark" ? <FiMoon /> : <FiSun />}
              type="text"
              style={{
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontSize: "20px",
                backgroundColor: "transparent",
                transition: "color 0.3s ease",
              }}
            />
          </Dropdown>

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
              <Link to="/register" style={{ color: "white" }}>
                {!isMobile && "Registrati"}
              </Link>
            </Button>
          )}
        </motion.div>
      )}
    </Header>
  );
};

export default Navbar;
