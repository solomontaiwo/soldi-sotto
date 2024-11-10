import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { firestore } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

const { Option } = Select;

const EditTransactionModal = ({ transaction, onClose }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);

  // Usa useMemo per memorizzare le categorie e prevenire la ricreazione a ogni render
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

  // Definisci updateCategories con useCallback e usa le categorie memorizzate con useMemo
  const updateCategories = useCallback((type) => {
    if (type === "expense") {
      setCategories(expenseCategories);
    } else if (type === "income") {
      setCategories(incomeCategories);
    }
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    updateCategories(transaction.type);
  }, [transaction.type, updateCategories]);

  const handleSaveChanges = async (values) => {
    const transactionRef = doc(firestore, "transactions", transaction.id);
    try {
      await updateDoc(transactionRef, {
        ...values,
        date: values.date.toDate(), // Converti la data in un oggetto JavaScript Date
      });
      message.success("Transazione aggiornata con successo");
      onClose(); // Chiudi la modale
    } catch (error) {
      message.error("Errore durante l'aggiornamento della transazione.");
    }
  };

  return (
    <Modal
      title="Modifica Transazione"
      open={true}
      centered // Aggiunge centratura verticale al modal
      onCancel={onClose}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            handleSaveChanges(values);
          })
          .catch((info) => {
            console.log("Errore di validazione:", info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: dayjs(transaction.date.toDate()), // Converti la data in dayjs per il DatePicker
          category: transaction.category,
        }}
      >
        {/* Tipo di Transazione */}
        <Form.Item
          name="type"
          label="Tipo di Transazione"
          rules={[{ required: true, message: "Seleziona il tipo di transazione" }]}
        >
          <Select onChange={(value) => updateCategories(value)}>
            <Option value="expense">Uscita</Option>
            <Option value="income">Entrata</Option>
          </Select>
        </Form.Item>

        {/* Importo */}
        <Form.Item
          name="amount"
          label="Importo (€)"
          rules={[{ required: true, message: "Inserisci un importo" }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        {/* Descrizione */}
        <Form.Item name="description" label="Descrizione" rules={[{ required: true, message: "Inserisci una descrizione" }]}>
          <Input />
        </Form.Item>

        {/* Data */}
        <Form.Item name="date" label="Data" rules={[{ required: true, message: "Seleziona la data" }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        {/* Categoria */}
        <Form.Item
          name="category"
          label="Categoria"
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
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;
