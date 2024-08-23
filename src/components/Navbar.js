import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
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
          <Link to="/">Home</Link>
        </li>
        {currentUser && (
          <>
            <li
              className={activeTab === "transactions" ? "active" : ""}
              onClick={() => setActiveTab("transactions")}
            >
              <Link to="/transactions">Transazioni</Link>
            </li>
            <li
              className={activeTab === "statistics" ? "active" : ""}
              onClick={() => setActiveTab("statistics")}
            >
              <Link to="/statistics">Statistiche</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
        {!currentUser && (
          <>
            <li
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              <Link to="/login">Login</Link>
            </li>
            <li
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              <Link to="/register">Registrazione</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;