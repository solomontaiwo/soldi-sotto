import React, { useState, useEffect } from "react";
import { useTransactions } from "../Transaction/TransactionProvider";
import { useAuth } from "../Auth/AuthProvider";
import {
  Card,
  message,
  Typography,
  Row,
  Col,
  Space,
  Select,
  DatePicker,
  Empty,
  Button,
  Modal,
} from "antd";
import EditTransactionModal from "./EditTransactionModal";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../utils/dayjs-setup";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import TransactionForm from "./TransactionForm";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useMediaQuery } from "react-responsive";
import { animationConfig } from "../../utils/animationConfig";
import { firestore } from "../../utils/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import LoadingWrapper from "../../utils/loadingWrapper";
import formatCurrency from "../../utils/formatCurrency";
import { useTheme } from "../../utils/ThemeProvider";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const loading = authLoading || transactionsLoading;

  const { theme } = useTheme();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const today = new Date();
      let startDate, endDate;

      if (period === "custom" && customRange) {
        [startDate, endDate] = customRange;
      } else {
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
          case "monthly":
          default:
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
            break;
        }
      }

      // Filtra le transazioni in base al periodo selezionato
      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date.seconds * 1000);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      setFilteredTransactions(filtered);
    }
  }, [transactions, period, customRange]);

  const handleEditClick = (transaction) => {
    setEditTransaction(transaction);
  };

  const handleDeleteClick = (transactionId) => {
    confirm({
      title: "Sei sicuro di voler eliminare questa transazione?",
      icon: <ExclamationCircleOutlined />,
      content: "Questa azione è irreversibile.",
      okText: "Sì, elimina",
      okType: "danger",
      cancelText: "Annulla",
      centered: true,
      onOk: async () => {
        try {
          await deleteDoc(doc(firestore, "transactions", transactionId));
          message.success("Transazione eliminata con successo");
        } catch (error) {
          console.error("Errore durante l'eliminazione:", error);
          message.error("Errore durante l'eliminazione della transazione.");
        }
      },
      onCancel() {
        console.log("Eliminazione annullata");
      },
      // Stile dinamico in base al tema
      className: theme === "dark" ? "dark-confirm-modal" : "",
    });
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value !== "custom") {
      setCustomRange(null);
    }
  };

  const handleRangeChange = (dates) => {
    setCustomRange(
      dates
        ? [dates[0].startOf("day").toDate(), dates[1].endOf("day").toDate()]
        : null
    );
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LoadingWrapper loading={loading}>
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          color: "var(--text-color)",
        }}
      >
        <motion.div
          {...animationConfig}
          style={{ textAlign: "center", marginBottom: "10px" }}
        >
          <Title
            level={2}
            style={{ textAlign: "center", color: "var(--primary-color)" }}
          >
            Transazioni
          </Title>
          <Text
            style={{
              textAlign: "center",
              display: "block",
              marginBottom: 20,
              color: "var(--text-color)",
            }}
          >
            Visualizza le tue transazioni, filtrate per il periodo desiderato.
          </Text>
        </motion.div>

        <motion.div {...animationConfig}>
          <Button
            type="primary"
            onClick={showModal}
            style={{
              width: "100%",
              height: isMobile ? "50px" : "60px",
              fontSize: isMobile ? "16px" : "18px",
              display: "block",
              margin: "0 auto",
              marginBottom: 20,
              backgroundColor: "var(--button-bg-color)",
              borderColor: "var(--button-bg-color)",
              color: "#fff",
            }}
          >
            Aggiungi Transazione
          </Button>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{
                width: "100%",
                textAlign: "center",
                color: "var(--text-color)",
              }}
            >
              <Option value="daily">Oggi</Option>
              <Option value="weekly">Settimana corrente</Option>
              <Option value="monthly">Mese corrente</Option>
              <Option value="annually">Anno corrente</Option>
              <Option value="custom">Personalizzato</Option>
            </Select>
            {period === "custom" && (
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <DatePicker
                  onChange={(date) =>
                    setCustomRange([date, customRange ? customRange[1] : null])
                  }
                  placeholder="Data Inizio"
                  style={{ width: "100%" }}
                />
                <DatePicker
                  onChange={(date) =>
                    setCustomRange([customRange ? customRange[0] : null, date])
                  }
                  placeholder="Data Fine"
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {isModalVisible && (
          <Modal
            title="Aggiungi Transazione"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            centered
          >
            <TransactionForm onFormSubmit={handleCancel} />
          </Modal>
        )}

        {filteredTransactions.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredTransactions.map((transaction) => (
              <Col xs={24} sm={12} md={8} lg={6} key={transaction.id}>
                <motion.div {...animationConfig}>
                  <Card
                    bordered={false}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      boxShadow: "0 4px 8px var(--shadow-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--card-background)",
                      color: "var(--text-color)",
                      height: "300px",
                      padding: "16px",
                    }}
                    actions={[
                      <EditOutlined
                        onClick={() => handleEditClick(transaction)}
                        style={{ color: "var(--text-color)" }}
                      />,
                      <DeleteOutlined
                        onClick={() => handleDeleteClick(transaction.id)}
                        style={{ color: "#f5222d" }}
                      />,
                    ]}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ wordBreak: "break-word" }}
                    >
                      <Text style={{ color: "var(--text-color)" }}>
                        <strong>Data:</strong>{" "}
                        {formatDate(transaction.date.toDate())}
                      </Text>
                      <Text style={{ color: "var(--text-color)" }}>
                        <strong>Descrizione:</strong> {transaction.description}
                      </Text>
                      <Text style={{ color: "var(--text-color)" }}>
                        <strong>Tipo: </strong>
                        <span
                          style={{
                            color:
                              transaction.type === "income"
                                ? "#4caf50"
                                : "#ff5c5c",
                          }}
                        >
                          {transaction.type === "income" ? "Entrata" : "Uscita"}
                        </span>
                      </Text>
                      <Text style={{ color: "var(--text-color)" }}>
                        <strong>Importo:</strong>{" "}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <Text style={{ color: "var(--text-color)" }}>
                        <strong>Categoria:</strong>{" "}
                        {transaction.category.charAt(0).toUpperCase() +
                          transaction.category.slice(1).toLowerCase() || "N/A"}
                      </Text>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        ) : (
          <motion.div
            {...animationConfig}
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <Empty description="Non ci sono transazioni per il periodo selezionato." />
          </motion.div>
        )}

        {editTransaction && (
          <EditTransactionModal
            transaction={editTransaction}
            onClose={() => setEditTransaction(null)}
          />
        )}
      </div>
    </LoadingWrapper>
  );
};

export default TransactionList;
