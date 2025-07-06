import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { Badge } from "react-bootstrap";
import { 
  FiHome, 
  FiList, 
  FiBarChart, 
  FiUser,
  FiLogOut 
} from "react-icons/fi";
import { useEffect, useState } from "react";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDemo, transactions, maxTransactions } = useUnifiedTransactions();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastScrollY && currentY > 40) {
            setVisible(false); // scroll down
          } else {
            setVisible(true); // scroll up
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navigationItems = [
    {
      key: "/dashboard",
      icon: <FiHome size={20} />,
      label: "Home",
      path: "/dashboard",
    },
    {
      key: "/transactions",
      icon: <FiList size={20} />,
      label: "Transazioni",
      path: "/transactions",
      badge: isDemo ? `${transactions.length}/${maxTransactions}` : null,
    },
    {
      key: "/analytics",
      icon: <FiBarChart size={20} />,
      label: "Analytics",
      path: "/analytics",
    },
    // Ultimo item: Profile se autenticato, Logout se demo
    ...(currentUser ? [{
      key: "/profile",
      icon: <FiUser size={20} />,
      label: "Profilo",
      path: "/profile",
    }] : [{
      key: "logout",
      icon: <FiLogOut size={20} />,
      label: "Esci",
      action: handleLogout,
    }]),
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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'var(--glass-bg)',
        borderTop: `1px solid var(--glass-border)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 1030,
        boxShadow: '0 -4px 25px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        transition: 'transform 0.35s cubic-bezier(.4,2,.6,1)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.key}
            onClick={() => handleNavigation(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              background: isActive 
                ? 'rgba(13, 110, 253, 0.15)' 
                : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: isActive ? '#0d6efd' : '#6c757d',
              minWidth: '56px',
              minHeight: '44px',
              borderRadius: '12px',
              backdropFilter: isActive ? 'blur(10px)' : 'none',
              boxShadow: isActive 
                ? '0 2px 8px rgba(13, 110, 253, 0.2)' 
                : 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.backdropFilter = 'blur(10px)';
              }
            }}
            onTouchEnd={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backdropFilter = 'none';
              }
            }}
          >
            <div className="position-relative">
              <div style={{ 
                marginBottom: '2px',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                filter: isActive ? 'drop-shadow(0 1px 2px rgba(13, 110, 253, 0.3))' : 'none'
              }}>
                {item.icon}
              </div>
              {item.badge && (
                <Badge 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{
                    fontSize: '9px',
                    padding: '2px 4px',
                    borderRadius: '8px',
                    lineHeight: '1',
                    marginTop: '-2px',
                    marginLeft: '-2px',
                    backgroundColor: 'rgba(13, 110, 253, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? '600' : '400',
                textAlign: 'center',
                lineHeight: '1',
                marginTop: '2px',
                textShadow: isActive ? '0 1px 2px rgba(13, 110, 253, 0.3)' : 'none'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation; 