import React from "react";
import { firestore } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const TransactionForm = () => {
  const { currentUser } = useAuth();

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
      style={{
        maxWidth: 500,
        margin: "20px auto",
        padding: 20,
        background: "#f6f6f6",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Tipo di Transazione */}
      <Form.Item
        label="Tipo di Transazione"
        name="type"
        rules={[{ required: true, message: "Seleziona il tipo di transazione" }]}
      >
        <Select>
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
        <Input placeholder="Descrizione (es. Spesa supermercato, Stipendio)" />
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
          <Option value="alimentazione">Alimentazione</Option>
          <Option value="affitto">Affitto</Option>
          <Option value="stipendio">Stipendio</Option>
          <Option value="intrattenimento">Intrattenimento</Option>
          <Option value="trasporti">Trasporti</Option>
          <Option value="altro">Altro</Option>
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
