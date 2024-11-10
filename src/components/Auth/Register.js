import React from "react";
import { Typography } from "antd";
import { motion } from "framer-motion";
import RegisterForm from "./RegisterForm";

const { Title, Text } = Typography;

const Register = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Crea un nuovo account su Soldi Sotto</Title>
      </motion.div>
      <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
        Inserisci i tuoi dettagli per registrarti.
      </Text>
      <RegisterForm /> {/* Usa RegisterForm */}
    </div>
  );
};

export default Register;
