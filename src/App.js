import React from "react";
import { Route, Routes } from "react-router-dom";
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
    </AuthProvider>
  );
};

export default App;
