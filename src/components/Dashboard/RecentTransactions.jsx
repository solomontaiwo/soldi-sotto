import { Card, Button, ListGroup } from "react-bootstrap";
import { FiArrowRight, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import formatCurrency from "../../utils/formatCurrency";
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';

const RecentTransactions = ({ transactions = [] }) => {
  RecentTransactions.propTypes = {
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['income', 'expense']).isRequired,
        date: PropTypes.object.isRequired,
        category: PropTypes.string,
      })
    ),
  };

  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  // Mostra solo le ultime 5 transazioni
  const recentTransactions = transactions.slice(0, 5);

  const formatDate = (date) => {
    // Gestisce sia oggetti Date che timestamp Firebase
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTransactionIcon = (type) => {
    return type === "income" ? (
      <FiTrendingUp style={{ color: "#198754" }} />
    ) : (
      <FiTrendingDown style={{ color: "#dc3545" }} />
    );
  };

  // Funzione per ottenere la label tradotta della categoria
  const getCategoryLabel = (category) => {
    if (!category) return '';
    return t('categories.' + category);
  };

  if (recentTransactions.length === 0) {
    return (
      <Card
        className="border-0 shadow-sm"
        style={{
          borderRadius: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Card.Body className="text-center p-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            📋
          </div>
          <h5 className="text-muted mb-3">{t('recentTransactions.emptyTitle')}</h5>
          <p className="text-muted mb-4">
            {t('recentTransactions.emptyDescription')}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/transactions")}
            style={{
              borderRadius: '20px',
              paddingLeft: '2rem',
              paddingRight: '2rem',
            }}
          >
            {t('recentTransactions.addFirst')}
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-dark fw-semibold mb-0">
          {t('recentTransactions.title')}
        </h4>
        
        <Button
          variant="link"
          onClick={() => navigate("/transactions")}
          className="text-primary text-decoration-none p-0 d-flex align-items-center gap-2"
        >
          {t('recentTransactions.viewAll')}
          <FiArrowRight size={16} />
        </Button>
      </div>

      <Card
        className="border-0 shadow-sm recent-transactions-card"
        style={{
          borderRadius: '2rem',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <ListGroup variant="flush">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListGroup.Item
                className="border-0 py-3 px-4"
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: 'transparent',
                  borderRadius: index === 0 ? '2rem 2rem 0 0' : index === recentTransactions.length - 1 ? '0 0 2rem 2rem' : '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate("/transactions")}
              >
                <div className="d-flex align-items-center justify-content-between w-100">
                  {/* Left side - Icon and details */}
                  <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: transaction.type === 'income' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                        fontSize: '20px',
                      }}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div
                        className="fw-medium text-dark mb-1"
                        style={{
                          fontSize: '1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {transaction.description}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>
                              {getCategoryLabel(transaction.category)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Amount */}
                  <div className="text-end flex-shrink-0">
                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: isMobile ? '1rem' : '1.125rem',
                        color: transaction.type === 'income' ? '#198754' : '#dc3545',
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            </motion.div>
          ))}
        </ListGroup>
        
        {/* Footer con link per vedere tutte le transazioni */}
        <Card.Footer
          className="border-0 text-center py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '0 0 2rem 2rem',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Button
            variant="link"
            onClick={() => navigate("/transactions")}
            className="text-primary text-decoration-none small fw-medium"
          >
            {t('recentTransactions.manageAll')} &rarr;
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default RecentTransactions; 