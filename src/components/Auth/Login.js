import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success("Login effettuato con successo!");
      navigate("/", { replace: true });
      window.location.reload(); // Forza un refresh completo per aggiornare lo stato globale
    } catch (error) {
      message.error("Errore durante il login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <Title level={2} style={styles.title}>Accedi al tuo account</Title>
        <Text type="secondary" style={styles.subtitle}>Benvenuto! Inserisci i tuoi dati per accedere.</Text>
        <Form layout="vertical" onFinish={handleLogin} style={styles.form}>
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
            <Button type="primary" htmlType="submit" loading={loading} icon={<ReloadOutlined />} block>
              Login
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary">Non hai un account? <a href="/register">Registrati</a></Text>
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
    maxWidth: 800,
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

export default Login;
