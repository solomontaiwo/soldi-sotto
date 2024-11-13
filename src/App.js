import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Transactions from "./components/Transaction/TransactionList";
import Stats from "./components/Stats/Stats";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./utils/ProtectedRoute";
import { ThemeProvider } from "./utils/ThemeProvider";
import { message } from "antd";

// Configura la posizione dei messaggi di avviso
message.config({
  top: 70 + (typeof window !== "undefined" && window.innerWidth < 768 ? 10 : 0), // Aggiusta l'offset per dispositivi mobili
});

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Route protette */}
          <Route element={<ProtectedRoute />}>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
