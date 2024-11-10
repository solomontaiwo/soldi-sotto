import React, { useState, useEffect, useCallback, useMemo } from "react";
import { firestore } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const TransactionForm = ({ onFormSubmit }) => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);

  // Definisci le categorie in base al tipo di transazione usando useMemo
  const expenseCategories = useMemo(() => [
    { value: "alimentazione", label: "🍔 Alimentazione" },
    { value: "affitto", label: "🏠 Affitto" },
    { value: "trasporti", label: "🚗 Trasporti" },
    { value: "intrattenimento", label: "🎉 Intrattenimento" },
    { value: "altro", label: "🔍 Altro" },
  ], []);

  const incomeCategories = useMemo(() => [
    { value: "stipendio", label: "💼 Stipendio" },
    { value: "bonus", label: "💰 Bonus" },
    { value: "regalo", label: "🎁 Regalo" },
    { value: "investimenti", label: "📈 Investimenti" },
    { value: "altro", label: "🔍 Altro" },
  ], []);

  // Funzione per aggiornare le categorie in base al tipo di transazione selezionato
  const updateCategories = useCallback((type) => {
    if (type === "expense") {
      setCategories(expenseCategories);
    } else if (type === "income") {
      setCategories(incomeCategories);
    }
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    updateCategories("expense"); // Imposta le categorie iniziali per il tipo "expense"
  }, [updateCategories]);

  const handleSubmit = async (values) => {
    if (currentUser) {
      try {
        await addDoc(collection(firestore, "transactions"), {
          userId: currentUser.uid,
          type: values.type,
          amount: parseFloat(values.amount),
          description: values.description,
          date: values.date.toDate(), // Converte da dayjs a JavaScript Date
          category: values.category,
        });
        message.success("Transazione aggiunta con successo!");
        onFormSubmit(); // Chiama la funzione per chiudere il form
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
        date: dayjs(), // Imposta la data di oggi come predefinita
      }}
    >
      {/* Tipo di Transazione */}
      <Form.Item
        label="Tipo di Transazione"
        name="type"
        rules={[{ required: true, message: "Seleziona il tipo di transazione" }]}
      >
        <Select onChange={(value) => updateCategories(value)}>
          <Option value="expense">Uscita</Option>
          <Option value="income">Entrata</Option>
        </Select>
      </Form.Item>

      {/* Importo */}
      <Form.Item
        label="Importo (€)"
        name="amount"
        rules={[{ required: true, message: "Inserisci l'importo" }]}
      >
        <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Importo" />
      </Form.Item>

      {/* Descrizione */}
      <Form.Item
        label="Descrizione"
        name="description"
        rules={[{ required: true, message: "Inserisci una descrizione" }]}
      >
        <Input placeholder="Es. Spesa, stipendio, kebab, ecc." />
      </Form.Item>

      {/* Data */}
      <Form.Item
        label="Data"
        name="date"
        rules={[{ required: true, message: "Seleziona la data" }]}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      {/* Categoria */}
      <Form.Item
        label="Categoria"
        name="category"
        rules={[{ required: true, message: "Seleziona una categoria" }]}
      >
        <Select placeholder="Seleziona Categoria">
          {categories.map((category) => (
            <Option key={category.value} value={category.value}>
              {category.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Pulsante di Invio */}
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: "100%", padding: "10px 0" }}>
          Aggiungi Transazione
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TransactionForm;
