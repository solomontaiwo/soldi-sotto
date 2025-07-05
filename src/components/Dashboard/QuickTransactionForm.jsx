import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useCategories } from "../../utils/categories";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const QuickTransactionForm = ({ onSuccess, onCancel, defaultTransactionType = "expense" }) => {
  QuickTransactionForm.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    defaultTransactionType: PropTypes.oneOf(["income", "expense"]),
  };

  const { addTransaction } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const [transactionType, setTransactionType] = useState(defaultTransactionType);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
  });

  const categories = transactionType === "expense" ? expenseCategories : incomeCategories;

  // Aggiorna il tipo di transazione quando cambia il default
  useEffect(() => {
    setTransactionType(defaultTransactionType);
  }, [defaultTransactionType]);

  // Imposta categoria predefinita quando cambiano le categorie
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].value }));
    }
  }, [categories, formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await addTransaction({
        type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        category: formData.category,
      });

      if (success) {
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          category: categories[0]?.value || "",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Errore nell'aggiunta della transazione:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setTransactionType(type);
    const newCategories = type === "expense" ? expenseCategories : incomeCategories;
    setFormData(prev => ({ 
      ...prev, 
      category: newCategories[0]?.value || "" 
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-2"
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
              borderRadius: "20px",
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
              borderRadius: "20px",
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

      {/* Quick Transaction Form */}
      <Form onSubmit={handleSubmit}>
        <Row className="g-2 mb-3">
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
                  borderRadius: "20px",
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
                  borderRadius: "20px",
                  fontSize: "15px",
                  background: "rgba(255, 255, 255, 0.85)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
              />
            </Form.Group>
          </Col>
        </Row>

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
              borderRadius: "20px",
              fontSize: "15px",
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          />
        </Form.Group>

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
              height: "42px",
              borderRadius: "20px",
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
            onClick={onCancel}
            className="flex-fill py-2"
            style={{
              borderRadius: "20px",
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
              borderRadius: "20px",
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
              "Aggiungi"
            )}
          </Button>
        </div>
      </Form>
    </motion.div>
  );
};

export default QuickTransactionForm; 