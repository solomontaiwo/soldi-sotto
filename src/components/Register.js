import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      // Redirect or handle successful registration here
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Registrazione</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome Utente"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Registrati</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;
