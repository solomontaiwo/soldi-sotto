import React, { useState, useEffect, useCallback } from "react";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Card, message, Typography, Row, Col, Space, Spin, Select, DatePicker, Empty, Button, Modal } from "antd";
import EditTransactionModal from "./EditTransactionModal";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { formatDate } from "../../dayjs-setup";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import TransactionForm from "../Transaction/TransactionForm";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns";
import { useMediaQuery } from "react-responsive";
import { animationConfig } from "../../utils/animationConfig";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const fetchTransactions = useCallback(() => {
    setLoading(true);
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

    const q = query(
      collection(firestore, "transactions"),
      where("userId", "==", currentUser.uid),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, period, customRange]);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        fetchTransactions();
      } else {
        setLoading(false);
      }
    }
  }, [currentUser, authLoading, fetchTransactions]);

  const handleEditClick = (transaction) => {
    setEditTransaction(transaction);
  };

  const handleDeleteClick = async (transactionId) => {
    try {
      await deleteDoc(doc(firestore, "transactions", transactionId));
      message.success("Transazione eliminata con successo");
    } catch (error) {
      message.error("Errore durante l'eliminazione della transazione.");
    }
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value !== "custom") {
      setCustomRange(null);
    }
  };

  const handleRangeChange = (dates) => {
    setCustomRange(dates ? [dates[0].startOf("day").toDate(), dates[1].endOf("day").toDate()] : null);
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Caricamento..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", color: "var(--text-color)" }}>
      <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center", color: "var(--primary-color)" }}>Transazioni</Title>
        <Text style={{ textAlign: "center", display: "block", marginBottom: 20, color: "var(--text-color)" }}>
          Visualizza le tue transazioni, filtrate per il periodo desiderato.
        </Text>
      </motion.div>

      <motion.div {...animationConfig}>
        <Button
          type="primary"
          onClick={showModal}
          style={{
            width: isMobile ? "100%" : "50%",
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
              width: isMobile ? "100%" : "50%",
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
            <RangePicker onChange={handleRangeChange} style={{ marginTop: 20 }} />
          )}
        </div>
      </motion.div>

      {isModalVisible && (
        <Modal title="Aggiungi Transazione" open={isModalVisible} onCancel={handleCancel} footer={null}>
          <TransactionForm onFormSubmit={handleCancel} />
        </Modal>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : transactions.length > 0 ? (
        <Row gutter={[16, 16]}>
          {transactions.map((transaction) => (
            <Col xs={24} sm={12} md={8} lg={6} key={transaction.id}>
              <motion.div {...animationConfig}>
                <Card
                  bordered={false}
                  style={{
                    boxShadow: "0 4px 8px var(--shadow-color)",
                    borderRadius: "8px",
                    backgroundColor: "var(--card-background)",
                    color: "var(--text-color)",
                  }}
                  actions={[
                    <EditOutlined onClick={() => handleEditClick(transaction)} style={{ color: "black" }} />,
                    <DeleteOutlined onClick={() => handleDeleteClick(transaction.id)} style={{ color: "#f5222d" }} />,
                  ]}
                >
                  <Space direction="vertical" size="small">
                    <Text style={{ color: "var(--text-color)" }}>
                      <strong style={{ color: "var(--text-color)" }}>Data:</strong> {formatDate(transaction.date.toDate())}
                    </Text>
                    <Text style={{ color: "var(--text-color)" }}>
                      <strong style={{ color: "var(--text-color)" }}>Descrizione:</strong> {transaction.description}
                    </Text>
                    <Text style={{ color: "var(--text-color)" }}>
                      <strong style={{ color: "var(--text-color)" }}>Tipo: </strong>
                      <span style={{ color: transaction.type === "income" ? "#4caf50" : "#ff5c5c" }}>
                        {transaction.type === "income" ? "Entrata" : "Uscita"}
                      </span>
                    </Text>
                    <Text style={{ color: "var(--text-color)" }}>
                      <strong style={{ color: "var(--text-color)" }}>Importo:</strong> {Number(transaction.amount).toFixed(2)} €
                    </Text>
                    <Text style={{ color: "var(--text-color)" }}>
                      <strong style={{ color: "var(--text-color)" }}>Categoria:</strong> {transaction.category || "N/A"}
                    </Text>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      ) : (
        <motion.div {...animationConfig} style={{ textAlign: "center", marginTop: "20px" }}>
          <Empty description="Non ci sono transazioni per il periodo selezionato." />
        </motion.div>
      )}

      {editTransaction && (
        <EditTransactionModal transaction={editTransaction} onClose={() => setEditTransaction(null)} />
      )}
    </div>
  );
};

export default TransactionList;
