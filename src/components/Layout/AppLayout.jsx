import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useUnifiedTransactions } from "../../context/UnifiedTransactionProvider";
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

  // Define public routes where navigation is not shown
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Show navigation if:
  // 1. It is not a public route AND
  // 2. (User is authenticated OR is in demo mode)
  const showNavigation = !isPublicRoute && (currentUser || isDemo);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showNavigation && !isMobile && <Navbar />}

      <main
        className={`flex-1 relative overflow-x-hidden transition-all ${
          showNavigation
            ? "pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pt-20 md:pb-6 px-4 md:px-8"
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