import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import { useAuth } from "../components/Auth/AuthProvider";
import { useUnifiedTransactions } from "../components/Transaction/UnifiedTransactionProvider";

// Lazy load components for better performance
const LandingPage = lazy(() => import("../components/Home/LandingPage"));
const Login = lazy(() => import("../components/Auth/Login"));
const Register = lazy(() => import("../components/Auth/Register"));
const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"));
const TransactionList = lazy(() => import("../components/Transaction/TransactionList"));
const TransactionAnalytics = lazy(() => import("../components/Analytics/TransactionAnalytics"));
const Profile = lazy(() => import("../components/Profile/Profile"));

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

const ProtectedRoute = ({ children, requiresAuth = false }) => {
  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiresAuth: PropTypes.bool,
  };
  
  const { currentUser, loading } = useAuth();
  const { isDemo } = useUnifiedTransactions();
  
  if (loading) return <PageLoader />;
  
  // Se richiede autenticazione e l'utente non è loggato
  if (requiresAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Se l'utente non è loggato e non è in modalità demo, mostra landing
  if (!currentUser && !isDemo) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const DemoAccessibleRoute = ({ children }) => {
  DemoAccessibleRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  // Questa route è accessibile sia a utenti demo che autenticati
  return <ProtectedRoute requiresAuth={false}>{children}</ProtectedRoute>;
};

const AuthenticatedOnlyRoute = ({ children }) => {
  AuthenticatedOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  // Questa route è accessibile solo a utenti autenticati
  return <ProtectedRoute requiresAuth={true}>{children}</ProtectedRoute>;
};

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rotte pubbliche */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />
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

        {/* Dashboard - accessibile a tutti (demo e autenticati) */}
        <Route 
          path="/dashboard" 
          element={
            <DemoAccessibleRoute>
              <Dashboard />
            </DemoAccessibleRoute>
          } 
        />

        {/* Transazioni - accessibili in modalità demo con limitazioni */}
        <Route 
          path="/transactions" 
          element={
            <DemoAccessibleRoute>
              <TransactionList />
            </DemoAccessibleRoute>
          } 
        />

        {/* Analytics - accessibili in modalità demo ma con limitazioni */}
        <Route 
          path="/analytics" 
          element={
            <DemoAccessibleRoute>
              <TransactionAnalytics />
            </DemoAccessibleRoute>
          } 
        />

        {/* Rotte solo per utenti autenticati */}
        <Route 
          path="/profile" 
          element={
            <AuthenticatedOnlyRoute>
              <Profile />
            </AuthenticatedOnlyRoute>
          } 
        />

        {/* Backward compatibility redirects */}
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="/stats" element={<Navigate to="/analytics" replace />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter; 