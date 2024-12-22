import React, { useState, useEffect, useCallback } from "react";
import { firestore } from "../../utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { useCategories } from "../../utils/categories";
import { Form, Input, InputNumber, DatePicker, Button } from "antd";
import { motion } from "framer-motion";
import {
  PlusOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const TransactionForm = ({ onFormSubmit }) => {
  const { currentUser } = useAuth();
  const { expenseCategories, incomeCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState("expense");
  const [selectedCategory, setSelectedCategory] = useState(null); // Stato per la categoria selezionata
  const [form] = Form.useForm();

  const updateCategories = useCallback(
    (type) => {
      setCategories(type === "expense" ? expenseCategories : incomeCategories);
    },
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    updateCategories(transactionType);
  }, [transactionType, updateCategories]);

  const handleSubmit = async (values) => {
    if (currentUser) {
      try {
        await addDoc(collection(firestore, "transactions"), {
          userId: currentUser.uid,
          type: transactionType,
          amount: parseFloat(values.amount),
          description: values.description,
          date: values.date.toDate(),
          category: selectedCategory, // Usa la categoria selezionata
        });
        onFormSubmit();
      } catch (error) {
        console.error("Errore durante l'aggiunta della transazione:", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px", // Spaziatura uniforme tra gli elementi
      }}
    >
      {/* Selettore tipo transazione */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <Button
          type={transactionType === "expense" ? "primary" : "default"}
          icon={<ShoppingCartOutlined />}
          style={{
            flex: 1,
            height: "50px",
            borderRadius: "12px",
            background: transactionType === "expense" ? "#ff4d4f" : undefined,
          }}
          onClick={() => setTransactionType("expense")}
        >
          Uscita
        </Button>
        <Button
          type={transactionType === "income" ? "primary" : "default"}
          icon={<WalletOutlined />}
          style={{
            flex: 1,
            height: "50px",
            borderRadius: "12px",
            background: transactionType === "income" ? "#52c41a" : undefined,
          }}
          onClick={() => setTransactionType("income")}
        >
          Entrata
        </Button>
      </div>

      {/* Formulario */}
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          date: dayjs(),
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px", // Spaziatura uniforme
        }}
      >
        {/* Importo */}
        <Form.Item
          label="Importo (€)"
          name="amount"
          rules={[{ required: true, message: "Inserisci l'importo" }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
            }}
            placeholder="Es. 50.00"
          />
        </Form.Item>

        {/* Descrizione */}
        <Form.Item
          label="Descrizione"
          name="description"
          rules={[{ required: true, message: "Inserisci una descrizione" }]}
        >
          <Input
            placeholder="Es. Spesa alimentare, Stipendio"
            style={{
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </Form.Item>

        {/* Data */}
        <Form.Item
          label="Data"
          name="date"
          rules={[{ required: true, message: "Seleziona la data" }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </Form.Item>

        {/* Categoria */}
        <Form.Item
          label="Categoria"
          name="category"
          rules={[{ required: true, message: "Seleziona una categoria" }]}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center", // Centra i bottoni
            }}
          >
            {categories.map((category) => (
              <Button
                key={category.value}
                type={
                  selectedCategory === category.value ? "primary" : "default"
                }
                style={{
                  padding: "10px 15px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  backgroundColor:
                    selectedCategory === category.value
                      ? "var(--primary-color)"
                      : "#f0f0f0",
                  border:
                    selectedCategory === category.value
                      ? "2px solid var(--primary-color)"
                      : "1px solid #d9d9d9",
                  color: selectedCategory === category.value ? "#fff" : "#333",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedCategory(category.value);
                  form.setFieldsValue({ category: category.value });
                }}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </Form.Item>

        {/* Pulsante di invio */}
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{
            height: "50px",
            borderRadius: "12px",
            fontSize: "16px",
            background: "var(--primary-color)",
            borderColor: "var(--primary-color)",
          }}
          icon={<PlusOutlined />}
        >
          Aggiungi Transazione
        </Button>
      </Form>
    </motion.div>
  );
};

export default TransactionForm;
