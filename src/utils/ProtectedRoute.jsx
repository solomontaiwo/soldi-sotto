import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/Auth/AuthProvider";
import { Spinner } from "react-bootstrap";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Mostra uno spinner di caricamento centrato finché lo stato di autenticazione è in fase di verifica
    return (
      <div 
        className="d-flex justify-content-center align-items-center"
        style={{ 
          minHeight: "100vh",
          background: "var(--background-color)",
          color: "var(--text-color)"
        }}
      >
        <div className="text-center">
          <Spinner 
            animation="border" 
            variant="primary" 
            style={{ width: "3rem", height: "3rem" }}
            className="mb-3"
          />
          <div className="fw-medium">Caricamento...</div>
        </div>
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
