import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
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
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: "20px" }}>
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
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Accedi
                    </Button>
                </Form.Item>
            </Form>
            <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
                Non hai un account? <Link to="/register">Registrati</Link>
            </Text>
        </motion.div>
    );
};

export default LoginForm;
