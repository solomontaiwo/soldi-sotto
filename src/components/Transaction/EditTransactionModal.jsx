import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
} from "antd";
import { firestore } from "../../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useCategories } from "../../utils/categories";
import dayjs from "dayjs";

const EditTransactionModal = ({ transaction, onClose }) => {
  const [form] = Form.useForm();
  const { expenseCategories, incomeCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction.category
  );

  const updateCategories = useCallback(
    (type) => {
      setCategories(type === "expense" ? expenseCategories : incomeCategories);
    },
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    updateCategories(transaction.type);
    form.setFieldsValue({ category: transaction.category });
  }, [transaction.type, transaction.category, updateCategories, form]);

  const handleSaveChanges = async (values) => {
    try {
      await updateDoc(doc(firestore, "transactions", transaction.id), {
        ...values,
        date: values.date.toDate(),
        category: selectedCategory,
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
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSaveChanges}
        layout="vertical"
        initialValues={{
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: dayjs(transaction.date.toDate()),
        }}
      >
        {/* Importo */}
        <Form.Item
          name="amount"
          label="Importo (€)"
          rules={[{ required: true, message: "Inserisci un importo" }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{
              width: "100%",
            }}
            placeholder="Es. 50.00"
          />
        </Form.Item>

        {/* Descrizione */}
        <Form.Item
          name="description"
          label="Descrizione"
          rules={[{ required: true, message: "Inserisci una descrizione" }]}
        >
          <Input placeholder="Es. Spesa alimentare, McDonald's, ecc." />
        </Form.Item>

        {/* Data */}
        <Form.Item
          name="date"
          label="Data"
          rules={[{ required: true, message: "Seleziona la data" }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{
              width: "100%",
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
              gap: "16px",
              justifyContent: "center",
            }}
          >
            {categories.map((category) => (
              <Button
                key={category.value}
                type={
                  selectedCategory === category.value ? "primary" : "default"
                }
                style={{
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

        {/* Pulsante di salvataggio */}
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{
            height: "40px",
          }}
        >
          Salva Modifiche
        </Button>
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;
