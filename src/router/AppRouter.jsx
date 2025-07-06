import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import { useAuth } from "../components/Auth/AuthProvider";
import AppLayout from "../components/Layout/AppLayout";

// Lazy load all main pages for better performance
const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"));
const TransactionList = lazy(() => import("../components/Transaction/TransactionList"));
const Analytics = lazy(() => import("../components/Analytics/TransactionAnalytics"));
const Stats = lazy(() => import("../components/Stats/Stats"));
const Profile = lazy(() => import("../components/Profile/Profile"));
const Home = lazy(() => import("../components/Home/Home"));
const LandingPage = lazy(() => import("../components/Home/LandingPage"));

// Lazy load components for better performance
const Login = lazy(() => import("../components/Auth/Login"));
const Register = lazy(() => import("../components/Auth/Register"));

// Loading component
const PageLoader = () => (
  <div 
    className="d-flex justify-content-center align-items-center vh-100"
    style={{ 
      background: "var(--background-primary)"
    }}
  >
    <Spinner animation="border" variant="primary" />
  </div>
);

// Route guards
const PublicRoute = ({ children }) => {
  PublicRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  const { currentUser, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  
  // Se l'utente è già loggato, reindirizza alla dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default AppRouter; 