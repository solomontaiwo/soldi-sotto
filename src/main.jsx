import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { TransactionProvider } from "./components/Transaction/TransactionProvider"; // Importa il provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <TransactionProvider> {/* Avvolgi con TransactionProvider */}
      <App />
    </TransactionProvider>
  </AuthProvider>
);
