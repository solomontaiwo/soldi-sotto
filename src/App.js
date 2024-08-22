import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import TransactionList from "./components/TransactionList";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionList />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
