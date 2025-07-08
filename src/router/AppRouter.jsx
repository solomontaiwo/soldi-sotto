import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy } from "react";
import { Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
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
  <AnimatePresence>
    <motion.div
      key="pageloader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "var(--background-primary)" }}
    >
      <Spinner animation="border" variant="primary" />
    </motion.div>
  </AnimatePresence>
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
  const location = useLocation();

  const routes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ) },
    { path: "/register", element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ) },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/transactions", element: <TransactionList /> },
    { path: "/analytics", element: <Analytics /> },
    { path: "/stats", element: <Stats /> },
    { path: "/profile", element: <Profile /> },
    { path: "/landing", element: <LandingPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ];

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  style={{ minHeight: '100vh' }}
                >
                  {element}
                </motion.div>
              }
            />
          ))}
        </Routes>
      </AnimatePresence>
    </AppLayout>
  );
};

export default AppRouter; 