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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showNavigation && !isMobile && <Navbar />}

      <main
        className={`flex-1 relative overflow-x-hidden transition-all ${
          showNavigation
            ? "pt-6 pb-20 md:pt-20 md:pb-6 px-4 md:px-8"
            : "p-0"
        }`}
      >
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </main>

      {showNavigation && isMobile && <BottomNavigation />}
    </div>
  );
};

export default AppLayout; 
