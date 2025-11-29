import { useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import Navbar from "../Navbar/Navbar";
import BottomNavigation from "./BottomNavigation";
import { useMediaQuery } from "react-responsive";
import PropTypes from "prop-types";

const AppLayout = ({ children }) => {
  AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const location = useLocation();
  const { currentUser } = useAuth();
  const { isDemo } = useUnifiedTransactions();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Definisce le rotte pubbliche dove non mostrare la navigazione
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Mostra la navigazione se:
  // 1. Non è una route pubblica E
  // 2. (L'utente è autenticato O è in modalità demo)
  const showNavigation = !isPublicRoute && (currentUser || isDemo);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--background-primary)',
      }}
    >
      {/* Top Navigation - Desktop */}
      {showNavigation && !isMobile && (
        <Navbar />
      )}

      {/* Main Content */}
      <main 
        style={{
          flex: 1,
          position: 'relative',
          overflowX: 'hidden',
          minHeight: showNavigation
            ? isMobile
              ? 'calc(100vh - 60px)' // Mobile con bottom nav
              : 'calc(100vh - 64px)'  // Desktop con top nav
            : '100vh', // Full height per landing page
          paddingTop: showNavigation ? '24px' : '0',
          paddingBottom: '0',
          paddingLeft: isMobile ? '1rem' : '2rem',
          paddingRight: isMobile ? '1rem' : '2rem',
          background: 'var(--background-primary)',
          transition: 'all var(--transition-base)',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      {showNavigation && isMobile && (
        <BottomNavigation />
      )}
    </div>
  );
};

export default AppLayout; 