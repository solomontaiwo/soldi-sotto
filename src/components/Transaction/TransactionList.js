import React, { useState, useEffect, useCallback } from "react";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Card, message, Typography, Row, Col, Space, Spin, Radio, DatePicker, Empty } from "antd";
import EditTransactionModal from "./EditTransactionModal";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { formatDate } from "../../dayjs-setup";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);

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

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
    if (e.target.value !== "custom") {
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Transazioni recenti</Title>
      </motion.div>
      <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
        Visualizza le tue transazioni recenti e filtra per periodo.
      </Text>

      <Space style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <Radio.Group value={period} onChange={handlePeriodChange} buttonStyle="solid">
          <Radio.Button value="daily">Giornaliero</Radio.Button>
          <Radio.Button value="weekly">Settimanale</Radio.Button>
          <Radio.Button value="monthly">Mensile</Radio.Button>
          <Radio.Button value="annually">Annuale</Radio.Button>
          <Radio.Button value="custom">Personalizzato</Radio.Button>
        </Radio.Group>
        {period === "custom" && (
          <RangePicker onChange={handleRangeChange} />
        )}
      </Space>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : transactions.length > 0 ? (
        <Row gutter={[16, 16]}>
          {transactions.map((transaction) => (
            <Col xs={24} sm={12} md={8} lg={6} key={transaction.id}>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card
                  bordered={false}
                  style={{
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                  }}
                  actions={[
                    <EditOutlined onClick={() => handleEditClick(transaction)} />,
                    <DeleteOutlined onClick={() => handleDeleteClick(transaction.id)} style={{ color: "red" }} />,
                  ]}
                >
                  <Space direction="vertical" size="small">
                    <Text>
                      <Text strong>Data:</Text> {formatDate(transaction.date.toDate())}
                    </Text>
                    <Text>
                      <Text strong>Descrizione:</Text> {transaction.description}
                    </Text>
                    <Text>
                      <Text strong>Tipo:</Text>{" "}
                      <span style={{ color: transaction.type === "income" ? "#3f8600" : "#cf1322" }}>
                        {transaction.type === "income" ? "Entrata" : "Uscita"}
                      </span>
                    </Text>
                    <Text>
                      <Text strong>Importo:</Text> {Number(transaction.amount).toFixed(2)} €
                    </Text>
                    <Text>
                      <Text strong>Categoria:</Text> {transaction.category || "N/A"}
                    </Text>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginTop: "20px" }}>
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
