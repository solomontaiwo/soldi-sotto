import { ThemeProvider } from "./utils/ThemeProvider";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { UnifiedTransactionProvider } from "./components/Transaction/UnifiedTransactionProvider";
import { NotificationProvider } from "./utils/notificationUtils";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <UnifiedTransactionProvider>
            <AppRouter />
          </UnifiedTransactionProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
