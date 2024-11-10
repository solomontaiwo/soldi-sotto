import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Card, message, Typography, Row, Col, Space } from "antd";
import EditTransactionModal from "./EditTransactionModal";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { formatDate } from "../../dayjs-setup"; // Importa la funzione formatDate per formattare la data

const { Text } = Typography;

const TransactionList = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(firestore, "transactions"),
        where("userId", "==", currentUser.uid),
        orderBy("date", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTransactions(data);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

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

  const closeModal = () => {
    setEditTransaction(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Transazioni Recenti</h2>
      <Row gutter={[16, 16]}>
        {transactions.map((transaction) => (
          <Col xs={24} sm={12} md={8} lg={6} key={transaction.id}>
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
          </Col>
        ))}
      </Row>

      {editTransaction && (
        <EditTransactionModal transaction={editTransaction} onClose={closeModal} />
      )}
    </div>
  );
};

export default TransactionList;
