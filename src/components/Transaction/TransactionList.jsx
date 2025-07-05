import { useState, useEffect } from "react";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useAuth } from "../Auth/AuthProvider";
import { Button, Modal, Alert, Form, Badge } from "react-bootstrap";
import EditTransactionModal from "./EditTransactionModal";
import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "./TransactionForm";
import { 
  format, 
  isToday, 
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import { it } from "date-fns/locale";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency";
import { 
  FiPlus, 
  FiTrash2, 
  FiFilter, 
  FiSearch,
  FiEdit2,
} from "react-icons/fi";
import { useCategories } from "../../utils/categories";

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { 
    transactions, 
    loading: transactionsLoading,
    deleteTransaction,
    isDemo,
    canAddMoreTransactions,
    maxTransactions
  } = useUnifiedTransactions();
  
  const { expenseCategories, incomeCategories } = useCategories();
  
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const loading = authLoading || transactionsLoading;

  // Frasi motivazionali a rotazione
  const motivationalQuotes = [
    "Ogni euro risparmiato è un euro guadagnato.",
    "Il miglior investimento sei tu.",
    "Piccoli passi, grandi risultati.",
    "Gestire le tue finanze è il primo passo verso la libertà.",
    "Non contare i centesimi, falli contare!",
    "La ricchezza si costruisce un giorno alla volta.",
    "Il futuro appartiene a chi lo pianifica.",
    "Risparmiare oggi per vivere meglio domani.",
    "Non è quanto guadagni, ma quanto risparmi che conta.",
    "La disciplina finanziaria è la chiave del successo."
  ];
  const [quote, setQuote] = useState("");
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Helper function to format date for grouping
  const formatGroupDate = (date) => {
    if (isToday(date)) return "Oggi";
    if (isYesterday(date)) return "Ieri";
    return format(date, "dd MMMM yyyy", { locale: it });
  };

  // Helper function to convert date consistently
  const getTransactionDate = (transaction) => {
    if (transaction.date?.toDate) {
      return transaction.date.toDate();
    } else if (transaction.date?.seconds) {
      return new Date(transaction.date.seconds * 1000);
    } else if (transaction.date instanceof Date) {
      return transaction.date;
    } else {
      return new Date(transaction.date);
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    
    transactions.forEach(transaction => {
      const date = getTransactionDate(transaction);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: date,
          displayDate: formatGroupDate(date),
          transactions: []
        };
      }
      
      groups[dateKey].transactions.push(transaction);
    });

    // Convert to array and sort by date (newest first)
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  // Filter and search logic
  useEffect(() => {
    if (transactions.length > 0) {
      const today = new Date();
      let startDate, endDate;

      // Period filter
      switch (period) {
        case "weekly":
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case "daily":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "annually":
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        case "all":
          startDate = new Date(0);
          endDate = new Date();
          break;
        case "monthly":
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
      }

      let filtered = transactions.filter((transaction) => {
        const transactionDate = getTransactionDate(transaction);
        const inDateRange = transactionDate >= startDate && transactionDate <= endDate;
        
        // Search filter
        const matchesSearch = searchTerm === "" || 
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter
        const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
        
        // Type filter
        const matchesType = selectedType === "all" || transaction.type === selectedType;
        
        return inDateRange && matchesSearch && matchesCategory && matchesType;
      });

      // Sort by date (newest first)
      filtered.sort((a, b) => getTransactionDate(b) - getTransactionDate(a));
      
      setFilteredTransactions(filtered);
    }
  }, [transactions, period, searchTerm, selectedCategory, selectedType]);

  const handleDeleteClick = async (transactionId) => {
    setDeleteConfirm(transactionId);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const success = await deleteTransaction(deleteConfirm);
      if (success) {
        setDeleteConfirm(null);
      }
    }
  };

  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category))];

  const periodOptions = [
    { value: "daily", label: "Oggi" },
    { value: "weekly", label: "Settimana" },
    { value: "monthly", label: "Mese" },
    { value: "annually", label: "Anno" },
    { value: "all", label: "Tutto" }
  ];

  // Helper functions
  const getCategoryEmoji = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find(c => c.value === category);
    return categoryData ? categoryData.label.split(" ")[0] : "💸";
  };

  const getCategoryLabel = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find(c => c.value === category);
    return categoryData ? categoryData.label : category;
  };

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: 'var(--gradient-soft-blue)' }}
      >
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: 'var(--primary-500)' }} role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <h5 className="text-dark">Caricamento transazioni...</h5>
        </div>
      </div>
    );
  }

  if (!currentUser && !isDemo) {
    return (
      <div 
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: 'var(--gradient-soft-blue)' }}
      >
        <div className="text-center">
          <h2 className="display-6 text-dark mb-3">Accesso richiesto</h2>
          <p className="lead text-muted">Effettua il login per visualizzare le tue transazioni</p>
        </div>
      </div>
    );
  }

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <div 
      className="min-vh-100" 
      style={{ 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        overflowX: 'hidden', // Previene scroll orizzontale
        WebkitOverflowScrolling: 'touch' // Smooth scrolling iOS
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="position-sticky top-0"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 1px 20px rgba(0, 0, 0, 0.08)",
          zIndex: 1020,
          padding: isMobile ? "16px 0" : "16px 0"
        }}
      >
        <div className="container">
          {/* Title and Stats */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className={`fw-bold text-dark mb-1 ${isMobile ? "h4" : "h2"}`}>
                💳 Le tue Transazioni
              </h1>
              <div className="text-primary fw-medium mb-2" style={{ fontSize: isMobile ? '1rem' : '1.15rem', opacity: 0.85 }}>
                <span style={{ fontStyle: 'italic' }}>{quote}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge 
                  className="small"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }}
                >
                  {filteredTransactions.length}
                </Badge>
                {filteredTransactions.length !== transactions.length && (
                  <span className="text-muted small">
                    di {transactions.length}
                  </span>
                )}
              </div>
            </div>
            
            {/* Add Button */}
            <Button
              variant="primary"
              size={isMobile ? "sm" : "md"}
              onClick={() => setShowModal(true)}
              disabled={isDemo && !canAddMoreTransactions}
              className="d-flex align-items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderColor: 'var(--primary-500)',
                borderRadius: '1.5rem',
                padding: isMobile ? '8px 16px' : '12px 20px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <FiPlus size={isMobile ? 16 : 18} />
              {!isMobile && <span>Aggiungi</span>}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="position-relative mb-3">
            <FiSearch 
              className="position-absolute top-50 start-0 translate-middle-y text-muted ms-3" 
              size={18} 
            />
            <Form.Control
              type="text"
              className="ps-5 border-0"
              placeholder="Cerca transazioni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                borderRadius: "1.5rem",
                padding: isMobile ? "12px 16px 12px 48px" : "14px 16px 14px 48px",
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            />
          </div>

          {/* Filters Row */}
          <div className={`d-flex gap-2 mb-2 ${isMobile ? 'flex-column' : 'flex-row'}`}>
            <Form.Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border-0"
              style={{ 
                borderRadius: "0.75rem",
                fontSize: isMobile ? "14px" : "16px",
                flex: isMobile ? "none" : "1",
                marginBottom: isMobile ? "8px" : "0",
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>

            <Button
              variant={showFilters ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center gap-1 px-3"
              style={{ 
                borderRadius: "0.75rem",
                background: showFilters 
                  ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' 
                  : 'rgba(255, 255, 255, 0.75)',
                borderColor: showFilters ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.3)',
                color: showFilters ? 'white' : 'var(--text-secondary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minWidth: isMobile ? "100%" : "auto"
              }}
            >
              <FiFilter size={16} />
              {!isMobile && "Filtri"}
              {isMobile && (showFilters ? "Nascondi Filtri" : "Mostra Filtri")}
            </Button>
          </div>

          {/* Demo Alert */}
          {isDemo && (
            <Alert variant="info" className="mb-0 border-0 small" style={{
              background: 'rgba(255, 255, 255, 0.6)',
              color: 'var(--text-secondary)',
              borderRadius: "1.5rem",
              padding: isMobile ? "8px 12px" : "12px 16px",
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <div className="d-flex align-items-center gap-2">
                <span>🎯</span>
                <span>
                  <strong>Modalità Demo</strong> - {transactions.length}/{maxTransactions} transazioni
                </span>
              </div>
            </Alert>
          )}

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className={`${isMobile ? 'd-flex flex-column gap-2' : 'row g-2'}`}>
                  <div className={isMobile ? 'w-100' : 'col-6'}>
                    <Form.Select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="border-0 small"
                      style={{ 
                        borderRadius: "0.75rem",
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="all">Tutti</option>
                      <option value="income">Entrate</option>
                      <option value="expense">Uscite</option>
                    </Form.Select>
                  </div>
                  <div className={isMobile ? 'w-100' : 'col-6'}>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border-0 small"
                      style={{ 
                        borderRadius: "0.75rem",
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="all">Categorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Transaction Timeline */}
      <div 
        className="container"
        style={{ 
          paddingBottom: isMobile ? "100px" : "40px",
          paddingTop: "20px"
        }}
      >
        {groupedTransactions.length > 0 ? (
          <div className="mt-4">
            <AnimatePresence>
              {groupedTransactions.map((group, groupIndex) => (
                <motion.div
                  key={group.date.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="mb-5"
                >
                  {/* Date Header */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div 
                      className="flex-grow-1" 
                      style={{ 
                        height: "2px", 
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '1px'
                      }} 
                    />
                    <span 
                      className="fw-medium px-3 py-1 timeline-date-badge"
                      style={{
                        background: 'var(--timeline-date-bg, rgba(255,255,255,0.65))',
                        color: 'var(--timeline-date-color, var(--text-secondary))',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        border: '1px solid var(--timeline-date-border, rgba(0,0,0,0.08))',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      {group.displayDate}
                    </span>
                    <div 
                      className="flex-grow-1" 
                      style={{ 
                        height: "2px", 
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '1px'
                      }} 
                    />
                  </div>

                  {/* Transactions for this date */}
                  <div className="d-flex flex-column gap-3">
                    {group.transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3"
                        style={{
                          background: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minHeight: isMobile ? "70px" : "60px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        {/* Left: Icon and Info */}
                        <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: isMobile ? "44px" : "40px",
                              height: isMobile ? "44px" : "40px",
                              backgroundColor: transaction.type === "income" 
                                ? "rgba(34, 197, 94, 0.15)" 
                                : "rgba(239, 68, 68, 0.15)",
                              color: transaction.type === "income" ? "#22c55e" : "#ef4444",
                              fontSize: isMobile ? "18px" : "16px"
                            }}
                          >
                            {transaction.type === "income" ? "💰" : getCategoryEmoji(transaction.category)}
                          </div>
                          
                          <div className="flex-grow-1" style={{ minWidth: 0, overflow: "hidden" }}>
                            <div 
                              className="fw-semibold text-dark mb-1"
                              style={{
                                fontSize: isMobile ? "15px" : "14px",
                                lineHeight: "1.3",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {transaction.description}
                            </div>
                            
                            {isMobile ? (
                              // Mobile: Stack info vertically 
                              <div>
                                <div className="text-muted small mb-1" style={{ fontSize: "12px" }}>
                                  {getTransactionDate(transaction).toLocaleDateString("it-IT", {
                                    day: "2-digit",
                                    month: "short"
                                  })}
                                </div>
                                <div className="text-muted small" style={{ fontSize: "11px", opacity: 0.8 }}>
                                  {getCategoryLabel(transaction.category)}
                                </div>
                              </div>
                            ) : (
                              // Desktop: Single line
                              <div className="text-muted small d-flex align-items-center gap-2">
                                <span>{getTransactionDate(transaction).toLocaleDateString("it-IT")}</span>
                                <span>•</span>
                                <span>{getCategoryLabel(transaction.category)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount and Actions */}
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          <div className="text-end">
                            <div
                              className="fw-bold"
                              style={{
                                fontSize: isMobile ? "16px" : "15px",
                                color: transaction.type === "income" ? "#22c55e" : "#ef4444",
                                lineHeight: "1.2"
                              }}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </div>
                            {isMobile && (
                              <div className="text-muted small" style={{ fontSize: "10px" }}>
                                {getTransactionDate(transaction).toLocaleDateString("it-IT", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTransaction(transaction);
                              }}
                              className="text-info p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "32px" : "28px",
                                height: isMobile ? "32px" : "28px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(13, 202, 240, 0.1)",
                                border: "1px solid rgba(13, 202, 240, 0.2)"
                              }}
                            >
                              <FiEdit2 size={isMobile ? 14 : 12} />
                            </Button>
                            
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(transaction.id);
                              }}
                              className="text-danger p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "32px" : "28px",
                                height: isMobile ? "32px" : "28px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)"
                              }}
                            >
                              <FiTrash2 size={isMobile ? 14 : 12} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-5"
            style={{ marginTop: '3rem' }}
          >
            <div 
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <span style={{ fontSize: '3rem' }}>💳</span>
            </div>
            <h3 className="text-dark fw-bold mb-2">Nessuna transazione trovata</h3>
            <p className="text-muted mb-4">
              {searchTerm || selectedCategory !== "all" || selectedType !== "all" 
                ? "Prova a modificare i filtri di ricerca"
                : "Inizia aggiungendo la tua prima transazione"
              }
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowModal(true)}
              disabled={isDemo && !canAddMoreTransactions}
              className="d-flex align-items-center gap-2 mx-auto"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderColor: 'var(--primary-500)',
                borderRadius: '1.5rem',
                padding: '12px 24px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiPlus size={20} />
              Aggiungi Transazione
            </Button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <TransactionForm
        show={showModal}
        onClose={() => setShowModal(false)}
        onFormSubmit={() => {
          // Aggiorna la lista delle transazioni se necessario
          // Le transazioni vengono aggiornate automaticamente tramite il provider
        }}
      />

      {/* Edit Transaction Modal */}
      {editTransaction && (
        <EditTransactionModal
          transaction={editTransaction}
          onClose={() => setEditTransaction(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={!!deleteConfirm}
        onHide={() => setDeleteConfirm(null)}
        backdrop={false}
        className="glass-modal"
        style={{
          background: "transparent"
        }}
      >
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 1055,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirm(null);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 400,
              duration: 0.3 
            }}
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 20px 40px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
              maxWidth: "480px",
              width: "100%",
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Decorative danger gradient */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none"
              }}
            />

            {/* Header */}
            <div className="p-4 pb-3">
              <div className="text-center mb-3">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontSize: "28px"
                  }}
                >
                  🗑️
                </div>
                <h4 className="fw-bold text-dark mb-2">
                  Elimina Transazione
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                  Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
                </p>
              </div>

              {/* Transaction Details Preview */}
              {deleteConfirm && (
                <div 
                  className="p-3 rounded-3 mb-4"
                  style={{
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.1)",
                    backdropFilter: "blur(10px)"
                  }}
                >
                  {(() => {
                    const transactionToDelete = transactions.find(t => t.id === deleteConfirm);
                    if (!transactionToDelete) return null;
                    
                    return (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold text-dark mb-1">
                            {transactionToDelete.description}
                          </div>
                          <small className="text-muted">
                            {getTransactionDate(transactionToDelete).toLocaleDateString("it-IT")} • {transactionToDelete.category}
                          </small>
                        </div>
                        <div className={`fw-bold ${transactionToDelete.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {transactionToDelete.type === 'income' ? '+' : '-'}
                          {formatCurrency(transactionToDelete.amount)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-fill py-3"
                  style={{
                    borderRadius: "16px",
                    fontWeight: "500",
                    fontSize: "16px",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Annulla
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-fill py-3 border-0 fw-semibold"
                  style={{
                    borderRadius: "16px",
                    fontSize: "16px",
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.95))",
                    boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 12px 35px rgba(239, 68, 68, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(239, 68, 68, 0.3)";
                  }}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Eliminando...
                    </div>
                  ) : (
                    "Elimina Definitivamente"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionList;
