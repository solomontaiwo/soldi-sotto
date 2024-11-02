import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { FiLogOut, FiHome, FiList, FiPieChart } from "react-icons/fi"; // Icone di react-icons
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="tabbed-navbar">
      <ul>
        <li
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <Link to="/soldi-sotto">
            <FiHome className="icon" />
            Home
          </Link>
        </li>
        {currentUser && (
          <>
            <li
              className={activeTab === "transactions" ? "active" : ""}
              onClick={() => setActiveTab("transactions")}
            >
              <Link to="/soldi-sotto/transactions">
                <FiList className="icon" />
                Transazioni
              </Link>
            </li>
            <li
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              <Link to="/soldi-sotto/stats">
                <FiPieChart className="icon" />
                Statistiche
              </Link>
            </li>
            <li>
              <button onClick={handleLogout}>
                <FiLogOut className="icon" />
                Logout
              </button>
            </li>
          </>
        )}
        {!currentUser && (
          <>
            <li
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              <Link to="/soldi-sotto/login">Login</Link>
            </li>
            <li
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              <Link to="/soldi-sotto/register">Registrazione</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
