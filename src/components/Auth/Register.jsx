import { Typography } from "antd";
import { motion } from "framer-motion";
import RegisterForm from "./RegisterForm";
import { animationConfig } from "../../utils/animationConfig";

const { Title, Text } = Typography;

const Register = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ textAlign: "center", color: "var(--primary-color)" }}>Crea un nuovo account su Soldi Sotto</Title>
        <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20, color: "var(--text-color)" }}>
          Inserisci i tuoi dettagli per registrarti.
        </Text>
        <RegisterForm /> {/* Usa RegisterForm */}
      </motion.div>
    </div>
  );
};

export default Register;
