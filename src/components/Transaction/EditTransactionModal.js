import React from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { firestore } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

const { Option } = Select;

const EditTransactionModal = ({ transaction, onClose }) => {
  const [form] = Form.useForm();

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
      visible={true}
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
      bodyStyle={{ padding: "20px" }} // Opzionale: modifica padding per un layout più compatto
      width={500} // Opzionale: imposta una larghezza personalizzata
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
          <Select>
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
            <Option value="alimentazione">Alimentazione</Option>
            <Option value="affitto">Affitto</Option>
            <Option value="stipendio">Stipendio</Option>
            <Option value="intrattenimento">Intrattenimento</Option>
            <Option value="trasporti">Trasporti</Option>
            <Option value="altro">Altro</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;
