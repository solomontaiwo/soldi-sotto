import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    const { email, password, username } = values;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      message.success("Registrazione avvenuta con successo!");
      navigate("/", { replace: true });
      window.location.reload(); // Forza un refresh completo per aggiornare lo stato globale
    } catch (error) {
      message.error("Errore durante la registrazione: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <Title level={2} style={styles.title}>Crea un nuovo account</Title>
        <Text type="secondary" style={styles.subtitle}>Inserisci i tuoi dettagli per registrarti.</Text>
        <Form layout="vertical" onFinish={handleRegister} style={styles.form}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Inserisci la tua email" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Inserisci la tua password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<UserAddOutlined />} block>
              Registrati
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary">Hai già un account? <a href="/login">Accedi</a></Text>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Occupare l'intero viewport verticalmente
    backgroundColor: "#f5f5f5",
  },
  container: {
    maxWidth: 400,
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
  },
  title: { marginBottom: "5px" },
  subtitle: { marginBottom: "20px" },
  form: { textAlign: "left" },
};

export default Register;
