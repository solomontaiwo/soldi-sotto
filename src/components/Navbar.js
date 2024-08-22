import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav>
      <div className="logo">SoldiSotto</div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {currentUser ? (
          <>
            <li>
              <Link to="/transactions">Transazioni</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Registrazione</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
