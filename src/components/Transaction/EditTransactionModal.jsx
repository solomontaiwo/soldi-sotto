import { useState, useEffect, useCallback } from "react";
import { useUnifiedTransactions } from "./UnifiedTransactionProvider";
import { useCategories } from "../../utils/categories";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown, FiSave } from "react-icons/fi";
import PropTypes from "prop-types";

const EditTransactionModal = ({ transaction, onClose }) => {
  EditTransactionModal.propTypes = {
    transaction: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      date: PropTypes.object.isRequired,
      category: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  const { updateTransaction } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const notification = useNotification();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [loading, setLoading] = useState(false);

  // Get transaction date consistently
  const getTransactionDate = (date) => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  };

  const [formData, setFormData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description,
    date: getTransactionDate(transaction.date).toISOString().split('T')[0],
  });

  const updateCategories = useCallback(
    (type) => {
      const categoryList = type === "expense" ? expenseCategories : incomeCategories;
      setCategories(categoryList);
    },
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    updateCategories(formData.type);
  }, [formData.type, updateCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await updateTransaction(transaction.id, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        category: selectedCategory,
      });
      
      if (success) {
        notification.success("Transazione aggiornata con successo!");
        onClose();
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error);
      notification.error("Errore nell'aggiornamento della transazione");
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
    setFormData(prev => ({ ...prev, type }));
    updateCategories(type);
  };

  return (
    <Modal 
      show={true} 
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
          background: "rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          zIndex: 1055,
          padding: "15px"
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 400,
            duration: 0.3 
          }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
            maxWidth: "650px",
            width: "100%",
            maxHeight: "85vh",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Subtle decorative gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "100px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.03))",
              pointerEvents: "none"
            }}
          />

          {/* Compact Header */}
          <div className="d-flex align-items-center justify-content-between p-3 pb-2">
            <div>
              <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.1))",
                    fontSize: "18px"
                  }}
                >
                  ✏️
                </div>
                Modifica Transazione
              </h4>
            </div>
            <Button
              variant="link"
              onClick={onClose}
              className="text-muted p-0 d-flex align-items-center justify-content-center"
              style={{ 
                fontSize: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.8)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                e.currentTarget.style.color = "var(--accent-error)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                e.currentTarget.style.color = "";
              }}
            >
              ×
            </Button>
          </div>

          {/* Compact Content */}
          <div 
            className="px-3 pb-3"
            style={{
              maxHeight: "calc(85vh - 80px)",
              overflowY: "auto"
            }}
          >
            {/* Transaction Type Selector */}
            <div className="mb-3">
              <Form.Label className="fw-semibold text-dark mb-2 small">
                Tipo di Transazione
              </Form.Label>
              <div className="d-flex gap-2">
                <Button
                  variant={formData.type === "expense" ? "danger" : "outline-danger"}
                  onClick={() => handleTypeChange("expense")}
                  className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: formData.type === "expense" 
                      ? "linear-gradient(135deg, var(--accent-error), #c82333)"
                      : "rgba(255, 255, 255, 0.8)",
                    border: formData.type === "expense" 
                      ? "none" 
                      : "2px solid var(--accent-error)"
                  }}
                >
                  <FiTrendingDown size={16} />
                  Uscita
                </Button>
                <Button
                  variant={formData.type === "income" ? "success" : "outline-success"}
                  onClick={() => handleTypeChange("income")}
                  className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: formData.type === "income" 
                      ? "linear-gradient(135deg, var(--accent-success), #157347)"
                      : "rgba(255, 255, 255, 0.8)",
                    border: formData.type === "income" 
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
                <Col xs={6}>
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
                        height: "42px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
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
                        height: "42px",
                        borderRadius: "12px",
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
                    height: "42px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
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
                    height: "42px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
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
                    background: formData.type === "expense" 
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
                      Salvando...
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <FiSave size={14} />
                      Salva Modifiche
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

export default EditTransactionModal;
