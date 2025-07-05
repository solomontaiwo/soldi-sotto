import { useState, useEffect, useCallback } from "react";
import { useUnifiedTransactions } from "./UnifiedTransactionProvider";
import { useCategories } from "../../utils/categories";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown, FiPlus } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import PropTypes from 'prop-types';

const TransactionForm = ({ show, onClose, onFormSubmit }) => {
  TransactionForm.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onFormSubmit: PropTypes.func.isRequired,
  };

  const { addTransaction } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState("expense");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const updateCategories = useCallback(
    (type) => {
      const categoryList = type === "expense" ? expenseCategories : incomeCategories;
      setCategories(categoryList);
      if (categoryList.length > 0) {
        setSelectedCategory(categoryList[0].value);
      }
    },
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    updateCategories(transactionType);
  }, [transactionType, updateCategories]);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      setTransactionType("expense");
      setSelectedCategory("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await addTransaction({
        type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        category: selectedCategory,
      });
      
      if (success) {
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
        });
        setSelectedCategory(categories[0]?.value || "");
        onFormSubmit();
        onClose();
      }
    } catch (error) {
      console.error("Errore nell'aggiunta della transazione:", error);
      notification.error("Errore nell'aggiunta della transazione");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeChange = (type) => {
    setTransactionType(type);
    updateCategories(type);
  };

  if (!show) return null;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      size="lg"
      backdrop={false}
      className="glass-modal"
      style={{
        background: "transparent"
      }}
    >
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          zIndex: 1055,
          padding: isMobile ? "20px" : "40px"
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.4 
          }}
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
            maxWidth: "650px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30%",
              left: "-5%",
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none"
            }}
          />

          {/* Header */}
          <div className="d-flex align-items-center justify-content-between p-4 pb-0">
            <div>
              <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.15))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(59, 130, 246, 0.2)"
                  }}
                >
                  ⚡
                </div>
                Nuova Transazione
              </h3>
              <p className="text-muted mb-0 ms-5 ps-3" style={{ fontSize: "0.95rem" }}>
                Aggiungi velocemente una nuova transazione
              </p>
            </div>
            <Button
              variant="link"
              onClick={onClose}
              className="p-0 d-flex align-items-center justify-content-center"
              style={{ 
                fontSize: "22px",
                width: "44px",
                height: "44px",
                borderRadius: "16px",
                background: 'var(--glass-bg, rgba(255,255,255,0.6))',
                color: 'var(--text-primary, #222)',
                border: "1px solid rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.color = "#dc3545";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--glass-bg, rgba(255,255,255,0.6))";
                e.currentTarget.style.color = "var(--text-primary, #222)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span style={{ color: 'inherit', fontWeight: 700 }}>×</span>
            </Button>
          </div>

          {/* Content */}
          <div 
            className="p-4 pt-3"
            style={{
              maxHeight: "calc(90vh - 120px)",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) transparent"
            }}
          >
            {/* Transaction Type Selector */}
            <div className="mb-3">
              <Form.Label className="fw-semibold text-dark mb-2 small">
                Tipo di Transazione
              </Form.Label>
              <div className="d-flex gap-2">
                <Button
                  variant={transactionType === "expense" ? "danger" : "outline-danger"}
                  onClick={() => handleTypeChange("expense")}
                  className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: transactionType === "expense" 
                      ? "linear-gradient(135deg, var(--accent-error), #c82333)"
                      : "rgba(255, 255, 255, 0.8)",
                    border: transactionType === "expense" 
                      ? "none" 
                      : "2px solid var(--accent-error)"
                  }}
                >
                  <FiTrendingDown size={16} />
                  Spesa
                </Button>
                <Button
                  variant={transactionType === "income" ? "success" : "outline-success"}
                  onClick={() => handleTypeChange("income")}
                  className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: transactionType === "income" 
                      ? "linear-gradient(135deg, var(--accent-success), #157347)"
                      : "rgba(255, 255, 255, 0.8)",
                    border: transactionType === "income" 
                      ? "none" 
                      : "2px solid var(--accent-success)"
                  }}
                >
                  <FiTrendingUp size={16} />
                  Entrata
                </Button>
              </div>
            </div>

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              {/* Amount and Date Row */}
              <Row className="mb-3">
                <Col xs={isMobile ? 12 : 6} className={isMobile ? "mb-3" : ""}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-dark small mb-1">
                      Importo (€)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      required
                      className="border-0"
                      style={{
                        height: "46px",
                        borderRadius: "14px",
                        fontSize: "15px",
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        fontWeight: "500"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={isMobile ? 12 : 6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-dark small mb-1">
                      Data
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                      className="border-0"
                      style={{
                        height: "46px",
                        borderRadius: "14px",
                        fontSize: "15px",
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark small mb-1">
                  Descrizione
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Es. Spesa alimentare, Stipendio..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  className="border-0"
                  style={{
                    height: "46px",
                    borderRadius: "14px",
                    fontSize: "15px",
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontWeight: "500"
                  }}
                />
              </Form.Group>

              {/* Category Select */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark small mb-2">
                  Categoria
                </Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="border-0"
                  style={{
                    height: "46px",
                    borderRadius: "14px",
                    fontSize: "15px",
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontWeight: "500"
                  }}
                >
                  <option value="">Seleziona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={onClose}
                  className="flex-fill py-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "500",
                    fontSize: "14px",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.15)"
                  }}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.amount || !formData.description || !selectedCategory}
                  className="flex-fill border-0 fw-semibold py-2"
                  style={{
                    borderRadius: "12px",
                    fontSize: "14px",
                    background: transactionType === "expense" 
                      ? "linear-gradient(135deg, var(--accent-error), #c82333)"
                      : "linear-gradient(135deg, var(--accent-success), #157347)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
                  }}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-border spinner-border-sm me-1" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Aggiungendo...
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <FiPlus size={16} />
                      Aggiungi {transactionType === "expense" ? "Spesa" : "Entrata"}
                    </div>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </Modal>
  );
};

export default TransactionForm;
