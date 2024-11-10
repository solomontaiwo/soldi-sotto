import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
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
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Form layout="vertical" onFinish={handleRegister} style={{ marginTop: "20px" }}>
                {/* <Form.Item
                    label="Nome utente"
                    name="username"
                    rules={[{ required: true, message: "Inserisci il tuo nome utente" }]}
                >
                    <Input placeholder="Nome utente" />
                </Form.Item> */}

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
                        Registrati
                    </Button>
                </Form.Item>
            </Form>
            <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: "10px" }}>
                Hai già un account? <Link to="/login">Accedi</Link>
            </Text>
        </motion.div>
    );
};

export default RegisterForm;
