import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal, Button, Card, Row, Col, Typography, Statistic, List, Space } from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import TransactionForm from "../Transaction/TransactionForm";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined } from "@ant-design/icons";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatDate } from "../../dayjs-setup"; // Importa la funzione formatDate da dayjs-setup.js
import { Link } from "react-router-dom"; // Per il link a login e registrazione

const { Title, Text } = Typography;

const Home = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const today = new Date();
      const startDate = startOfMonth(today);
      const endDate = endOfMonth(today);

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
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title level={2}>Benvenuto in SoldiSotto</Title>
        {currentUser ? (
          <Text type="secondary">Una vista rapida delle tue finanze per aiutarti a rimanere in controllo.</Text>
        ) : (
          <Text type="secondary">
            <Link to="/login">Accedi</Link> o <Link to="/register">registrati</Link> per scoprire come SoldiSotto può aiutarti a monitorare le tue finanze e gestire le tue transazioni.
          </Text>
        )}
      </motion.div>

      {currentUser && (
        <>
          <Row gutter={16} style={{ marginBottom: "20px" }} justify="space-around">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Entrate"
                  value={stats.totalIncome.toFixed(2)}
                  prefix={<ArrowUpOutlined style={{ color: "#3f8600" }} />}
                  suffix="€"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Uscite"
                  value={stats.totalExpense.toFixed(2)}
                  prefix={<ArrowDownOutlined style={{ color: "#cf1322" }} />}
                  suffix="€"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Saldo" value={stats.balance.toFixed(2)} suffix="€" />
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

          <Modal title="Aggiungi Transazione" visible={isModalVisible} onCancel={handleCancel} footer={null}>
            <TransactionForm onFormSubmit={handleCancel} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Home;
