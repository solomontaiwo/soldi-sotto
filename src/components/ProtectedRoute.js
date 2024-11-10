import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Auth/AuthProvider";
import { Spin } from "antd";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Mostra uno spinner di caricamento centrato finché lo stato di autenticazione è in fase di verifica
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Caricamento..." />
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
