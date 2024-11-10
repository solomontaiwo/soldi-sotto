import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { firestore } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

const { Option } = Select;

const EditTransactionModal = ({ transaction, onClose }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);

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

  const updateCategories = useCallback((type) => {
    setCategories(type === "expense" ? expenseCategories : incomeCategories);
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    updateCategories(transaction.type);
  }, [transaction.type, updateCategories]);

  const handleSaveChanges = async (values) => {
    try {
      await updateDoc(doc(firestore, "transactions", transaction.id), {
        ...values,
        date: values.date.toDate(),
      });
      message.success("Transazione aggiornata con successo");
      onClose();
    } catch (error) {
      message.error("Errore durante l'aggiornamento della transazione.");
    }
  };

  return (
    <Modal
      title="Modifica Transazione"
      open={true}
      centered
      onCancel={onClose}
      onOk={() => form.validateFields().then(handleSaveChanges).catch((info) => console.log("Errore di validazione:", info))}
      style={{ color: "var(--text-color)" }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: dayjs(transaction.date.toDate()),
          category: transaction.category,
        }}
      >
        <Form.Item
          name="type"
          label="Tipo di Transazione"
          rules={[{ required: true, message: "Seleziona il tipo di transazione" }]}
        >
          <Select onChange={updateCategories} style={{ color: "var(--text-color)" }}>
            <Option value="expense">Uscita</Option>
            <Option value="income">Entrata</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Importo (€)"
          rules={[{ required: true, message: "Inserisci un importo" }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%", color: "var(--text-color)" }} />
        </Form.Item>

        <Form.Item name="description" label="Descrizione" rules={[{ required: true, message: "Inserisci una descrizione" }]}>
          <Input style={{ color: "var(--text-color)" }} />
        </Form.Item>

        <Form.Item name="date" label="Data" rules={[{ required: true, message: "Seleziona la data" }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%", color: "var(--text-color)" }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoria"
          rules={[{ required: true, message: "Seleziona una categoria" }]}
        >
          <Select placeholder="Seleziona Categoria" style={{ color: "var(--text-color)" }}>
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
