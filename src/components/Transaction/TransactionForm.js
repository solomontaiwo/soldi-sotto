import React, { useState, useEffect, useCallback } from "react";
import { firestore } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { useCategories } from "../../utils/categories";
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const TransactionForm = ({ onFormSubmit }) => {
  const { currentUser } = useAuth();
  const { expenseCategories, incomeCategories } = useCategories();
  const [categories, setCategories] = useState([]);

  const updateCategories = useCallback((type) => {
    setCategories(type === "expense" ? expenseCategories : incomeCategories);
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    updateCategories("expense");
  }, [updateCategories]);

  const handleSubmit = async (values) => {
    if (currentUser) {
      try {
        await addDoc(collection(firestore, "transactions"), {
          userId: currentUser.uid,
          type: values.type,
          amount: parseFloat(values.amount),
          description: values.description,
          date: values.date.toDate(),
          category: values.category,
        });
        message.success("Transazione aggiunta con successo!");
        onFormSubmit();
      } catch (error) {
        message.error("Errore durante l'aggiunta della transazione.");
        console.error("Errore:", error);
      }
    }
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={{
        type: "expense",
        date: dayjs(),
      }}
    >
      <Form.Item
        label="Tipo di Transazione"
        name="type"
        rules={[{ required: true, message: "Seleziona il tipo di transazione" }]}
        className="transaction-input"
      >
        <Select
          onChange={(value) => updateCategories(value)}
          className="transaction-select"
        >
          <Option value="expense">Uscita</Option>
          <Option value="income">Entrata</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Importo (€)"
        name="amount"
        rules={[{ required: true, message: "Inserisci l'importo" }]}
      >
        <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Importo" />
      </Form.Item>

      <Form.Item
        label="Descrizione"
        name="description"
        rules={[{ required: true, message: "Inserisci una descrizione" }]}
        className="transaction-input"
      >
        <Input placeholder="Es. Spesa, stipendio, kebab, ecc." className="transaction-input" />
      </Form.Item>

      <Form.Item
        label="Data"
        name="date"
        rules={[{ required: true, message: "Seleziona la data" }]}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} className="transaction-date-picker" />
      </Form.Item>

      <Form.Item
        label="Categoria"
        name="category"
        rules={[{ required: true, message: "Seleziona una categoria" }]}
        className="transaction-input"
      >
        <Select placeholder="Seleziona Categoria" className="transaction-select">
          {categories.map((category) => (
            <Option key={category.value} value={category.value}>
              {category.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: "100%", padding: "10px 0", backgroundColor: "var(--button-bg-color)", borderColor: "var(--button-bg-color)", color: "#fff" }}>
          Aggiungi Transazione
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TransactionForm;
