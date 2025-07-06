import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { Button, Dropdown, Badge } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiUser,
  FiLogOut,
  FiHome,
  FiList,
  FiBarChart,
} from "react-icons/fi";
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDemo, transactions, maxTransactions, clearTransactions } = useUnifiedTransactions();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleBackToHome = async () => {
    if (window.confirm(t('navbar.demoExitConfirm'))) {
      await clearTransactions();
      window.location.replace('/');
    }
  };

  const navigationItems = [
    { label: t('navbar.dashboard'), path: "/dashboard", icon: <FiHome /> },
    { label: t('navbar.transactions'), path: "/transactions", icon: <FiList /> },
    { label: t('navbar.analytics'), path: "/analytics", icon: <FiBarChart /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed-top"
      style={{
        height: "64px",
        backgroundColor: "var(--glass-bg)",
        backdropFilter: "blur(35px)",
        WebkitBackdropFilter: "blur(35px)",
        borderBottom: `1px solid var(--glass-border)`,
        boxShadow: "0 1px 20px rgba(0, 0, 0, 0.08)",
        zIndex: 1030,
      }}
    >
      <div className="container-fluid h-100">
        <div className="d-flex align-items-center justify-content-between h-100 w-100">
          {/* Logo a sinistra */}
          <div className="d-flex align-items-center gap-2">
            <Link 
              to="/" 
              className="text-decoration-none text-dark fw-bold"
              style={{ 
                fontSize: "1.35rem",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
                lineHeight: 1.1,
                minWidth: '120px',
                maxWidth: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginRight: '8px'
              }}
            >
              💰 Soldi Sotto
            </Link>
            {isDemo && (
              <Badge
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(25, 135, 84, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                {transactions.length}/{maxTransactions}
              </Badge>
            )}
          </div>
          {/* Tutto il resto a destra */}
          {!isMobile && (
            <div className="d-flex align-items-center gap-2 ms-auto">
              {(currentUser || isDemo) && navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-decoration-none px-3 py-2 rounded-pill transition-all"
                  style={{
                    color: location.pathname === item.path ? "#0d6efd" : "#495057",
                    fontWeight: "500",
                    fontSize: "16px",
                    backgroundColor: location.pathname === item.path 
                      ? "rgba(13, 110, 253, 0.15)" 
                      : "transparent",
                    transition: "all 0.2s ease",
                    textShadow: location.pathname === item.path 
                      ? "0 1px 2px rgba(13, 110, 253, 0.2)" 
                      : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                      e.target.style.color = "#0d6efd";
                      e.target.style.backdropFilter = "blur(10px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#495057";
                      e.target.style.backdropFilter = "none";
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {currentUser && (
                <Link
                  to="/profile"
                  className="text-decoration-none px-3 py-2 rounded-pill transition-all"
                  style={{
                    color: location.pathname === "/profile" ? "#0d6efd" : "#495057",
                    fontWeight: "500",
                    fontSize: "16px",
                    backgroundColor: location.pathname === "/profile" 
                      ? "rgba(13, 110, 253, 0.15)" 
                      : "transparent",
                    transition: "all 0.2s ease",
                    textShadow: location.pathname === "/profile" 
                      ? "0 1px 2px rgba(13, 110, 253, 0.2)" 
                      : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== "/profile") {
                      e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                      e.target.style.color = "#0d6efd";
                      e.target.style.backdropFilter = "blur(10px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== "/profile") {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#495057";
                      e.target.style.backdropFilter = "none";
                    }
                  }}
                >
                  {t('navbar.profile')}
                </Link>
              )}
              {/* Pulsanti Back to Home e Register a destra, compatti, e Logout per autenticato */}
              {isDemo && !currentUser && (
                <>
                  <Button
                    variant="outline-primary"
                    className="fw-medium"
                    style={{
                      borderRadius: "10px",
                      fontSize: "15px",
                      padding: "6px 14px",
                      border: "1.2px solid #0d6efd",
                      background: "rgba(13,110,253,0.06)",
                      color: "#0d6efd",
                      minWidth: '0',
                      transition: 'all 0.2s',
                    }}
                    onClick={handleBackToHome}
                  >
                    {t('navbar.backToHome')}
                  </Button>
                  <Button
                    variant="primary"
                    className="fw-medium"
                    style={{
                      borderRadius: "10px",
                      fontSize: "15px",
                      padding: "6px 14px",
                      background: "rgba(13, 110, 253, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      minWidth: '0',
                    }}
                    onClick={() => navigate('/register')}
                  >
                    {t('navbar.register')}
                  </Button>
                </>
              )}
              {currentUser && (
                <Button
                  variant="outline-secondary"
                  className="fw-medium"
                  style={{
                    borderRadius: "10px",
                    fontSize: "15px",
                    padding: "6px 14px",
                    border: "1.2px solid #6c757d",
                    background: "rgba(108,117,125,0.06)",
                    color: "#495057",
                    minWidth: '0',
                    transition: 'all 0.2s',
                  }}
                  onClick={handleLogout}
                >
                  {t('navbar.logout')}
                </Button>
              )}
            </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div>
              {(currentUser || isDemo) ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as={Button}
                    variant="link"
                    className="text-dark border-0 shadow-none"
                    style={{
                      fontSize: "20px",
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "10px",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <FiMenu />
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu 
                    className="border-0 shadow"
                    style={{ 
                      borderRadius: "16px",
                      backgroundColor: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(25px)",
                      WebkitBackdropFilter: "blur(25px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                      minWidth: "200px"
                    }}
                  >
                    {navigationItems.map((item) => (
                      <Dropdown.Item
                        key={item.path}
                        as={Link}
                        to={item.path}
                        className="d-flex align-items-center gap-2 py-2"
                        style={{
                          color: location.pathname === item.path ? "#0d6efd" : "#495057",
                          backgroundColor: location.pathname === item.path 
                            ? "rgba(13, 110, 253, 0.1)" 
                            : "transparent",
                          borderRadius: "8px",
                          margin: "2px 8px",
                          fontSize: "15px",
                          fontWeight: "500"
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Dropdown.Item>
                    ))}
                    
                    {currentUser && (
                      <>
                        <Dropdown.Divider style={{ margin: "8px 0", opacity: 0.3 }} />
                        <Dropdown.Item
                          as={Link}
                          to="/profile"
                          className="d-flex align-items-center gap-2 py-2"
                          style={{
                            color: location.pathname === "/profile" ? "#0d6efd" : "#495057",
                            backgroundColor: location.pathname === "/profile" 
                              ? "rgba(13, 110, 253, 0.1)" 
                              : "transparent",
                            borderRadius: "8px",
                            margin: "2px 8px",
                            fontSize: "15px",
                            fontWeight: "500"
                          }}
                        >
                          <FiUser />
                          {t('navbar.profile')}
                        </Dropdown.Item>
                      </>
                    )}
                    
                    {/* Pulsante Registrati solo per utente demo su mobile */}
                    {isDemo && !currentUser && (
                      <>
                        <Dropdown.Divider style={{ margin: "8px 0", opacity: 0.3 }} />
                        <Dropdown.Item
                          onClick={() => navigate('/register')}
                          className="d-flex align-items-center gap-2 py-2 fw-medium text-primary"
                          style={{
                            borderRadius: "8px",
                            margin: "2px 8px",
                            fontSize: "15px",
                            fontWeight: "600"
                          }}
                        >
                          <FiUser />
                          {t('navbar.register')}
                        </Dropdown.Item>
                      </>
                    )}
                    
                    {/* Logout solo se autenticato (mai in demo) */}
                    {currentUser && (
                      <>
                        <Dropdown.Divider style={{ margin: "8px 0", opacity: 0.3 }} />
                        <Dropdown.Item
                          onClick={handleLogout}
                          className="d-flex align-items-center gap-2 py-2 text-danger"
                          style={{
                            borderRadius: "8px",
                            margin: "2px 8px",
                            fontSize: "15px",
                            fontWeight: "500"
                          }}
                        >
                          <FiLogOut />
                          {t('navbar.logout')}
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login">
                    <Button 
                      variant="link"
                      size="sm"
                      className="text-muted text-decoration-none"
                      style={{ fontSize: "14px" }}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      variant="primary"
                      size="sm"
                      className="fw-medium"
                      style={{
                        borderRadius: "12px",
                        fontSize: "14px",
                        padding: "6px 12px",
                        background: "rgba(13, 110, 253, 0.9)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)"
                      }}
                    >
                      Registrati
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
