import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { FiBarChart, FiHome, FiList, FiLogOut, FiZap } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDemo, transactions, maxTransactions, clearTransactions, stopDemo } = useUnifiedTransactions();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleBackToHome = async () => {
    if (!window.confirm(t("navbar.demoExitConfirm"))) return;
    await clearTransactions?.();
    stopDemo?.();
    navigate("/");
  };

  const navigationItems = [
    { label: t("navbar.dashboard"), path: "/dashboard", icon: <FiHome /> },
    { label: t("navbar.transactions"), path: "/transactions", icon: <FiList /> },
    { label: t("navbar.analytics"), path: "/analytics", icon: <FiBarChart /> },
  ];

  return (
    <motion.nav
      initial={{ y: -24 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <FiZap />
          </div>
          <span className="hidden sm:block">Soldi Sotto</span>
        </Link>
        {isDemo && (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {transactions.length}/{maxTransactions} demo
          </Badge>
        )}

        {!isMobile && (
          <div className="flex items-center gap-2">
            {(currentUser || isDemo) &&
              navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            {currentUser && (
              <Link
                to="/profile"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === "/profile"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t("navbar.profile")}
              </Link>
            )}
            {isDemo && !currentUser && (
              <>
                <Button variant="outline" size="sm" onClick={handleBackToHome}>
                  {t("navbar.backToHome")}
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  {t("navbar.register")}
                </Button>
              </>
            )}
            {currentUser && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <FiLogOut className="h-4 w-4" /> {t("navbar.logout")}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
