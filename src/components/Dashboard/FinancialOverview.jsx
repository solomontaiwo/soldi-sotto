import { Card, Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency";
import PropTypes from "prop-types";

const FinancialOverview = ({ stats = {} }) => {
  FinancialOverview.propTypes = {
    stats: PropTypes.shape({
      totalIncome: PropTypes.number,
      totalExpense: PropTypes.number,
      balance: PropTypes.number,
      transactionCount: PropTypes.number,
    }),
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  const {
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    transactionCount = 0,
  } = stats;

  const statisticsData = [
    {
      title: "Entrate Totali",
      value: totalIncome,
      icon: <FiTrendingUp size={24} />,
      color: "#198754",
      isPositive: true,
    },
    {
      title: "Uscite Totali",
      value: totalExpense,
      icon: <FiTrendingDown size={24} />,
      color: "#dc3545",
      isPositive: false,
    },
    {
      title: "Bilancio",
      value: balance,
      icon: <FiDollarSign size={24} />,
      color: balance >= 0 ? "#198754" : "#dc3545",
      isPositive: balance >= 0,
    },
  ];

  return (
    <div>
      <h4 className="text-dark fw-semibold mb-3">
        Panoramica Finanziaria
      </h4>
      
      <Row className="g-3 mb-4">
        {statisticsData.map((stat, index) => (
          <Col key={index} xs={12} md={4}>
            <Card 
              className="h-100 border-0 shadow-sm"
              style={{
                borderRadius: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  
                  <div className="text-end">
                    <div 
                      className="fw-bold"
                      style={{
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: stat.color,
                      }}
                    >
                      {formatCurrency(stat.value)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h6 className="text-muted mb-0 fw-medium">
                    {stat.title}
                  </h6>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Transaction Count */}
      <div className="text-center">
        <div 
          className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
          style={{
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            color: '#0d6efd',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          📊 {transactionCount} transazioni totali
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview; 