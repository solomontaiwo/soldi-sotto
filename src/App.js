import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Transactions from "./components/Transaction/TransactionList";
import Stats from "./components/Stats/Stats";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;