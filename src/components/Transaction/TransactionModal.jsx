import { useState, useEffect, useCallback } from "react";
import { useUnifiedTransactions } from "./UnifiedTransactionProvider";
import { useCategories } from "../../utils/categories";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown, FiPlus, FiSave } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import PropTypes from 'prop-types';

// Modale unica per aggiunta e modifica transazione
const TransactionModal = ({ show, onClose, onSubmit, transaction }) => {
  TransactionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func, // opzionale, fallback su add/update
    transaction: PropTypes.object, // null per nuova, oggetto per modifica
  };

  const isEdit = !!transaction;
  const { addTransaction, updateTransaction } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stato form
  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date
      ? (transaction.date instanceof Date
          ? transaction.date
          : transaction.date?.toDate?.() || new Date(transaction.date)
        ).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    category: transaction?.category || "",
  });

  // Aggiorna categorie in base al tipo
  const updateCategories = useCallback(
    (type) => {
      const categoryList = type === "expense" ? expenseCategories : incomeCategories;
      setCategories(categoryList);
      if (!formData.category || !categoryList.find(c => c.value === formData.category)) {
        setFormData(prev => ({ ...prev, category: categoryList[0]?.value || "" }));
      }
    },
    [expenseCategories, incomeCategories, formData.category]
  );

  useEffect(() => {
    updateCategories(formData.type);
    // eslint-disable-next-line
  }, [formData.type, expenseCategories, incomeCategories]);

  // Reset form quando la modale si apre (solo per nuova)
  useEffect(() => {
    if (show && !isEdit) {
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        category: expenseCategories[0]?.value || "",
      });
    }
    if (show && isEdit && transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: (transaction.date instanceof Date
          ? transaction.date
          : transaction.date?.toDate?.() || new Date(transaction.date)
        ).toISOString().split('T')[0],
        category: transaction.category,
      });
    }
    // eslint-disable-next-line
  }, [show, isEdit, transaction]);

  // Gestione submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let success = false;
      if (isEdit) {
        success = await (onSubmit
          ? onSubmit(formData)
          : updateTransaction(transaction.id, {
              type: formData.type,
              amount: parseFloat(formData.amount),
              description: formData.description,
              date: new Date(formData.date),
              category: formData.category,
            })
        );
        if (success) notification.success("Transazione aggiornata con successo!");
      } else {
        success = await (onSubmit
          ? onSubmit(formData)
          : addTransaction({
              type: formData.type,
              amount: parseFloat(formData.amount),
              description: formData.description,
              date: new Date(formData.date),
              category: formData.category,
            })
        );
        if (success) notification.success("Transazione aggiunta con successo!");
      }
      if (success) {
        onClose();
      }
    } catch {
      notification.error("Errore nella transazione");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, type }));
    updateCategories(type);
  };

  if (!show) return null;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      size="lg"
      backdrop={true}
      className="glass-modal"
      style={{}}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ 
          type: "spring", 
          damping: 28, 
          stiffness: 320,
          duration: 0.32 
        }}
        style={{
          background: document.documentElement.classList.contains('dark-theme')
            ? 'rgba(30,41,59,0.98)'
            : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '28px',
          border: document.documentElement.classList.contains('dark-theme')
            ? '1.5px solid #334155'
            : '1px solid #e5e7eb',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          width: 'auto',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-0 w-100">
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
                {isEdit ? "✏️" : "⚡"}
              </div>
              {isEdit ? "Modifica Transazione" : "Nuova Transazione"}
            </h3>
            <p className="text-muted mb-0 ms-5 ps-3" style={{ fontSize: "0.95rem" }}>
              {isEdit
                ? "Modifica i dettagli della transazione"
                : "Aggiungi velocemente una nuova transazione"}
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
          className="p-4 pt-3 w-100"
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
                Spesa
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontWeight: "500"
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
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
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
                disabled={loading || !formData.amount || !formData.description || !formData.category}
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
                    {isEdit ? "Salvando..." : "Aggiungendo..."}
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    {isEdit ? <FiSave size={16} /> : <FiPlus size={16} />}
                    {isEdit ? "Salva Modifiche" : `Aggiungi ${formData.type === "expense" ? "Spesa" : "Entrata"}`}
                  </div>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </motion.div>
    </Modal>
  );
};

export default TransactionModal; 