import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Text } = Typography;

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        const { email, password } = values;
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            message.success("Login effettuato con successo!");
            navigate("/", { replace: true });
        } catch (error) {
            message.error("Errore durante il login: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                maxWidth: 400,
                margin: "0 auto",
                padding: "20px",
                backgroundColor: "var(--card-background)",  // Colore di sfondo della card
                borderRadius: "8px",
                boxShadow: "0 4px 8px var(--shadow-color)", // Ombra adattata al tema
            }}
        >
            <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: "20px" }}>
                <Form.Item
                    label={<span style={{ color: "var(--text-color)" }}>Email</span>} // Colore label
                    name="email"
                    rules={[{ required: true, message: "Inserisci la tua email" }]}
                >
                    <Input
                        placeholder="Ad esempio, kebab@kebab.com"
                        style={{
                            backgroundColor: "var(--background-color)",
                            color: "var(--text-color)",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: "var(--text-color)" }}>Password</span>} // Colore label
                    name="password"
                    rules={[{ required: true, message: "Inserisci la tua password" }]}
                >
                    <Input.Password
                        placeholder="La tua password segreta e complessa"
                        style={{
                            backgroundColor: "var(--background-color)",
                            color: "var(--text-color)",
                        }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{
                            backgroundColor: "var(--button-bg-color)",
                            borderColor: "var(--button-bg-color)",
                            color: "#fff", // Colore testo bianco
                        }}
                    >
                        Accedi
                    </Button>
                </Form.Item>
            </Form>

            <Text
                type="secondary"
                style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "10px",
                    color: "var(--text-color)",
                }}
            >
                Non hai un account? <Link to="/register" style={{ color: "var(--primary-color)" }}>Registrati</Link>
            </Text>
        </motion.div>
    );
};

export default LoginForm;
