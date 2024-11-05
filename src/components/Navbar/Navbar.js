import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { FiLogIn, FiLogOut, FiUserPlus, FiHome, FiList, FiPieChart } from "react-icons/fi";
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
      <div className="navbar-logo">
        <Link to="/soldi-sotto">
          <img src={`${process.env.PUBLIC_URL}/icon.png`} alt="Logo" className="logo-icon" />
        </Link>
      </div>
      <ul className="navbar-links">
        <li
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <Link to="/soldi-sotto">
            <FiHome className="icon" />
            <span className="link-label">Home</span>
          </Link>
        </li>
        {currentUser ? (
          <>
            <li
              className={activeTab === "transactions" ? "active" : ""}
              onClick={() => setActiveTab("transactions")}
            >
              <Link to="/transactions">
                <FiList className="icon" />
                <span className="link-label">Transazioni</span>
              </Link>
            </li>
            <li
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              <Link to="/stats">
                <FiPieChart className="icon" />
                <span className="link-label">Statistiche</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="auth-button">
                <FiLogOut className="icon" />
                <span className="link-label">Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="auth-links">
              <Link to="/login">
                <FiLogIn className="icon" /> {/* Icona di login */}
                <span className="link-label">Sign in</span>
              </Link>
              <span className="divider">|</span>
              <Link to="/register">
                <FiUserPlus className="icon" /> {/* Icona di registrazione */}
                <span className="link-label">Get started</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
