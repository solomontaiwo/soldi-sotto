import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired, // 'children' deve essere un nodo React ed è obbligatorio
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Stato di caricamento iniziale

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Il caricamento è finito quando riceviamo una risposta
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
