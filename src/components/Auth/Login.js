import React from "react";
import { Typography } from "antd";
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";

const { Title, Text } = Typography;

const Login = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center", color: "var(--primary-color)" }}>Accedi a Soldi Sotto</Title>
      </motion.div>
      <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20, color: "var(--text-color)" }}>
        Inserisci le tue credenziali per accedere al tuo account.
      </Text>
      <LoginForm /> {/* Usa LoginForm */}
    </div>
  );
};

export default Login;
