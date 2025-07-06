import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { UnifiedTransactionProvider } from "./components/Transaction/UnifiedTransactionProvider";
import { BrowserRouter } from 'react-router-dom';
// Import i18n configuration for internationalization support
import './utils/i18n';

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <UnifiedTransactionProvider>
      <BrowserRouter basename="/soldi-sotto">
      <App />
      </BrowserRouter>
    </UnifiedTransactionProvider>
  </AuthProvider>
);
