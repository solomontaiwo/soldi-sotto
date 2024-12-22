import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Button, message } from "antd";
import { firestore } from "../../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useCategories } from "../../utils/categories";
import dayjs from "dayjs";

const EditTransactionModal = ({ transaction, onClose }) => {
  const [form] = Form.useForm();
  const { expenseCategories, incomeCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category); // Stato per la categoria selezionata

  const updateCategories = useCallback(
    (type) => {
      setCategories(type === "expense" ? expenseCategories : incomeCategories);
    },
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    updateCategories(transaction.type);
    // Imposta la categoria selezionata iniziale nel form
    form.setFieldsValue({ category: transaction.category });
  }, [transaction.type, transaction.category, updateCategories, form]);

  const handleSaveChanges = async (values) => {
    try {
      await updateDoc(doc(firestore, "transactions", transaction.id), {
        ...values,
        date: values.date.toDate(),
        category: selectedCategory, // Usa la categoria selezionata
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
      footer={null} // Rimuove il footer predefinito
      style={{ color: "var(--text-color)" }}
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
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px", // Spaziatura uniforme tra gli elementi
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
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
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
          name="date"
          label="Data"
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
                  borderRadius: "20px", // Bottoni più arrotondati
                  fontSize: "14px",
                  backgroundColor:
                    selectedCategory === category.value
                      ? "var(--primary-color)" // Colore vivace per il bottone selezionato
                      : "#f0f0f0", // Colore neutro per i bottoni non selezionati
                  border:
                    selectedCategory === category.value
                      ? "2px solid var(--primary-color)" // Bordo evidente per i bottoni selezionati
                      : "1px solid #d9d9d9", // Bordo sottile per i bottoni non selezionati
                  color: selectedCategory === category.value ? "#fff" : "#333", // Testo bianco o scuro
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedCategory(category.value); // Aggiorna lo stato della categoria
                  form.setFieldsValue({ category: category.value }); // Aggiorna il valore nel form
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
            height: "50px",
            borderRadius: "12px",
            fontSize: "16px",
            background: "var(--primary-color)",
            borderColor: "var(--primary-color)",
          }}
        >
          Salva Modifiche
        </Button>
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;
