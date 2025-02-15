import { useState, useEffect, useCallback } from "react";
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
import PropTypes from "prop-types";

const EditTransactionModal = ({ transaction, onClose }) => {
  EditTransactionModal.propTypes = {
    transaction: PropTypes.shape({
      id: PropTypes.string.isRequired, // `id` deve essere una stringa ed è obbligatoria
      type: PropTypes.string.isRequired, // `type` deve essere una stringa ed è obbligatoria
      amount: PropTypes.number.isRequired, // `amount` deve essere un numero ed è obbligatorio
      description: PropTypes.string.isRequired, // `description` deve essere una stringa ed è obbligatoria
      date: PropTypes.shape({
        toDate: PropTypes.func.isRequired, // `date.toDate` deve essere una funzione ed è obbligatoria
      }).isRequired,
      category: PropTypes.string.isRequired, // `category` deve essere una stringa ed è obbligatoria
    }).isRequired,
    onClose: PropTypes.func.isRequired, // `onClose` deve essere una funzione ed è obbligatoria
  };

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
    } catch {
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
          label="Importo (€)"
          name="amount"
          rules={[{ required: true, message: "Inserisci l'importo" }]}
        >
          <Input
            style={{ width: "100%" }}
            placeholder="Es. 50,00"
            onChange={(e) => {
              let value = e.target.value.replace(",", ".");
              if (!isNaN(value) && value !== "") {
                form.setFieldsValue({ amount: value });
              }
            }}
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
