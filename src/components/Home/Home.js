import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Modal, Button, Card, Row, Col, Typography, Statistic, List, Space, Spin, Radio, DatePicker, Form, Input, message } from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { firestore, auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import TransactionForm from "../Transaction/TransactionForm";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined } from "@ant-design/icons";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns";
import { formatDate } from "../../dayjs-setup";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Home = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);

  // Funzione per calcolare e aggiornare le statistiche
  const calculateStats = (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") totalIncome += parseFloat(tx.amount) || 0;
      if (tx.type === "expense") totalExpense += parseFloat(tx.amount) || 0;
    });

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  };

  // Funzione per fetchare le transazioni e aggiornare le statistiche
  const fetchTransactionsAndStats = useCallback(() => {
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
        amount: parseFloat(doc.data().amount) || 0,
      }));
      setTransactions(data);
      calculateStats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, period, customRange]);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        fetchTransactionsAndStats();
      } else {
        setLoading(false);
      }
    }
  }, [currentUser, authLoading, fetchTransactionsAndStats]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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

  const handleLogin = async (values) => {
    const { email, password } = values;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success("Login effettuato con successo!");
    } catch (error) {
      message.error("Errore durante il login: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Benvenuto su Soldi Sotto</Title>
      </motion.div>
      <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
        La tua nuova app per la gestione delle tue spese e delle tue entrate.
      </Text>

      {(loading || authLoading) ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : currentUser ? (
        <>
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

          <Row gutter={16} style={{ marginBottom: "20px" }} justify="space-around">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                {stats && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Statistic
                      title="Entrate"
                      value={stats.totalIncome.toFixed(2)}
                      prefix={<ArrowUpOutlined style={{ color: "#3f8600" }} />}
                      suffix="€"
                    />
                  </motion.div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                {stats && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Statistic
                      title="Uscite"
                      value={stats.totalExpense.toFixed(2)}
                      prefix={<ArrowDownOutlined style={{ color: "#cf1322" }} />}
                      suffix="€"
                    />
                  </motion.div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                {stats && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <Statistic title="Saldo" value={stats.balance.toFixed(2)} suffix="€" />
                  </motion.div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                style={{ width: "100%", height: "100%" }}
              >
                Aggiungi Transazione
              </Button>
            </Col>
          </Row>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <Card title="Transazioni Recenti" bordered={false} style={{ marginTop: "20px" }}>
              <List
                itemLayout="horizontal"
                dataSource={transactions.slice(0, 5)}
                renderItem={(transaction) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space direction="horizontal">
                          <Text strong>{transaction.description}</Text>
                          <Text type="secondary">{new Date(formatDate(transaction.date.toDate())).toLocaleDateString()}</Text>
                        </Space>
                      }
                      description={
                        <Text type={transaction.type === "income" ? "success" : "danger"}>
                          {transaction.type === "income" ? "+" : "-"}{transaction.amount.toFixed(2)} €
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>

          <Modal title="Aggiungi Transazione" visible={isModalVisible} onCancel={handleCancel} footer={null}>
            <TransactionForm onFormSubmit={handleCancel} />
          </Modal>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Title level={3} style={{ textAlign: "center" }}>Accedi a SoldiSotto</Title>
            <Form layout="vertical" onFinish={handleLogin}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Inserisci la tua email" }]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Inserisci la tua password" }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Accedi
                </Button>
              </Form.Item>
            </Form>
            <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
              Non hai un account? <Link to="/register">Registrati</Link>
            </Text>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
