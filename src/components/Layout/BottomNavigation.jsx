import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { FiHome, FiList, FiBarChart, FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDemo, transactions, maxTransactions, startDemo } = useUnifiedTransactions();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setVisible(currentY < lastScrollY || currentY < 20);
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navigationItems = [
    { key: "/dashboard", icon: <FiHome size={20} />, label: t("navbar.dashboard"), path: "/dashboard" },
    { key: "/transactions", icon: <FiList size={20} />, label: t("navbar.transactions"), path: "/transactions", badge: isDemo ? `${transactions.length}/${maxTransactions}` : null },
    { key: "/analytics", icon: <FiBarChart size={20} />, label: t("navbar.analytics"), path: "/analytics" },
    ...(currentUser
      ? [{ key: "/profile", icon: <FiUser size={20} />, label: t("navbar.profile"), path: "/profile" }]
      : [
          { key: "login", icon: <FiLogIn size={20} />, label: t("navLogin"), action: () => navigate("/login") },
          { key: "register", icon: <FiUserPlus size={20} />, label: t("navRegister"), action: () => navigate("/register") },
        ]),
  ];

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ height: "70px" }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-around px-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => handleNavigation(item)}
              className={`relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isActive ? "bg-primary/15 text-primary shadow-sm" : "bg-muted text-foreground"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px]">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="absolute -top-1 -right-2">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
      {!currentUser && !isDemo && (
        <div className="px-4 pb-3">
          <button
            onClick={startDemo}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-500 py-2 text-sm font-semibold text-white shadow-lg"
          >
            {t("landing.tryDemo")}
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomNavigation;
