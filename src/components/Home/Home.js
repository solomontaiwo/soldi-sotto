import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Modal, Button, Card, Typography, List } from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../utils/firebase";
import TransactionForm from "../Transaction/TransactionForm";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatDate } from "../../utils/dayjs-setup";
import LoginForm from "../Auth/LoginForm";
import { useMediaQuery } from "react-responsive";
import { animationConfig } from "../../utils/animationConfig";
import LoadingWrapper from "../../utils/loadingWrapper";

const { Title, Text } = Typography;

const Home = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const fullLoading = authLoading || loading;

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
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ textAlign: "center", marginBottom: "10px" }}
        >
          <Title level={2} style={{ color: "var(--primary-color)" }}>Accedi a Soldi Sotto</Title>
        </motion.div>
        <Text style={{ textAlign: "center", display: "block", marginBottom: 20, color: "var(--text-color)" }}>
          Inserisci le tue credenziali per accedere al tuo account.
        </Text>
        <LoginForm />
      </div>
    );
  }

  return (
    <LoadingWrapper loading={fullLoading}>
      <div className="container">
        <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
          <Title level={2} style={{ color: "var(--primary-color)" }}>Benvenuto su Soldi Sotto</Title>
          <Text style={{ textAlign: "center", display: "block", marginBottom: 20, color: "var(--text-color)" }}>
            La tua nuova app per la gestione delle tue spese e delle tue entrate.
          </Text>

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
            }}
          >
            Aggiungi Transazione
          </Button>
        </motion.div>

        <motion.div {...animationConfig}>
          <Card
            style={{
              backgroundColor: "var(--card-background)",
              color: "var(--text-color)",
              marginTop: "10px",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={transactions.slice(0, 5)}
              renderItem={(transaction) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text strong style={{ color: "var(--text-color)", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {transaction.description}
                        </Text>
                        <Text style={{ color: "var(--text-color)", marginLeft: "10px", whiteSpace: "nowrap" }}>
                          {new Date(formatDate(transaction.date.toDate())).toLocaleDateString()}
                        </Text>
                      </div>
                    }
                    description={
                      <Text style={{ color: transaction.type === "income" ? "#4caf50" : "#ff5c5c" }}>
                        {transaction.type === "income" ? "+" : "-"}{transaction.amount.toFixed(2)} €
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />

          </Card>
        </motion.div>

        <Modal
          title={<span style={{ color: "var(--text-color)" }}>Aggiungi Transazione</span>}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <TransactionForm onFormSubmit={handleCancel} />
        </Modal>
      </div>
    </LoadingWrapper>
  );
};

export default Home;
