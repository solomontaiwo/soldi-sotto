import ReactDOM from "react-dom/client";
import "./main.css";
import App from "./App";
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "./utils/ThemeProvider";
import { NotificationProvider } from "./utils/notificationUtils";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { UnifiedTransactionProvider } from "./components/Transaction/UnifiedTransactionProvider";
// Import i18n configuration for internationalization support
import './utils/i18n';

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <NotificationProvider>
      <AuthProvider>
        <UnifiedTransactionProvider>
          <BrowserRouter basename="/soldi-sotto">
            <App />
          </BrowserRouter>
        </UnifiedTransactionProvider>
      </AuthProvider>
    </NotificationProvider>
  </ThemeProvider>
);
