import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Text } = Typography;

const RegisterForm = () => {
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
        } catch (error) {
            message.error("Errore durante la registrazione: " + error.message);
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
                backgroundColor: "var(--card-background)", // Sfondo adattato al tema
                borderRadius: "8px",
                boxShadow: "0 4px 8px var(--shadow-color)", // Ombra adattata al tema
            }}
        >
            <Form layout="vertical" onFinish={handleRegister} style={{ marginTop: "20px" }}>
                <Form.Item
                    label={<span style={{ color: "var(--text-color)" }}>Email</span>} // Colore adattato al tema
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
                    label={<span style={{ color: "var(--text-color)" }}>Password</span>}
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
                            backgroundColor: "var(--button-bg-color)", // Sfondo del pulsante adattato al tema
                            borderColor: "var(--button-bg-color)", // Bordo adattato al tema
                            color: "#fff", // Colore del testo bianco
                        }}
                    >
                        Registrati
                    </Button>
                </Form.Item>
            </Form>
            <Text
                type="secondary"
                style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "10px",
                    color: "var(--text-color)", // Testo adattato al tema
                }}
            >
                Hai già un account? <Link to="/login" style={{ color: "var(--primary-color)" }}>Accedi</Link>
            </Text>
        </motion.div>
    );
};

export default RegisterForm;
