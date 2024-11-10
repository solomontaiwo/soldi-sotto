import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Modal, Button, Card, Typography, List, Space, Spin } from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import TransactionForm from "../Transaction/TransactionForm";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatDate } from "../../dayjs-setup";
import { useMediaQuery } from "react-responsive";
import LoginForm from "../Auth/LoginForm";
import { animationConfig } from "../../utils/animationConfig";

const { Title, Text } = Typography;

const Home = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Funzione per fetchare le transazioni
  const fetchTransactions = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);
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
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      const unsubscribe = fetchTransactions();
      return () => unsubscribe && unsubscribe();
    } else if (!currentUser) {
      setLoading(false);
    }
  }, [authLoading, currentUser, fetchTransactions]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (!authLoading && !currentUser) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "10px" }}>
          <Title level={2} style={{ textAlign: "center" }}>Accedi a Soldi Sotto</Title>
        </motion.div>
        <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
          Inserisci le tue credenziali per accedere al tuo account.
        </Text>
        <LoginForm />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Benvenuto su Soldi Sotto</Title>
        <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
          La tua nuova app per la gestione delle tue spese e delle tue entrate.
        </Text>

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
          }}
        >
          Aggiungi Transazione
        </Button>
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : (
        <>
          <motion.div {...animationConfig} transition={{delay: 0.5 }}>
            <Card title="Transazioni Recenti" bordered={true} style={{ marginTop: "10px" }}>
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

          <Modal title="Aggiungi Transazione" open={isModalVisible} onCancel={handleCancel} footer={null}>
            <TransactionForm onFormSubmit={handleCancel} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Home;
