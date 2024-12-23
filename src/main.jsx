import ReactDOM from "react-dom/client";
import App from "./App";
import { App as AntdApp } from "antd"; // Importa il wrapper App di Ant Design
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
