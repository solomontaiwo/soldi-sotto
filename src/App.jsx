import { ThemeProvider } from "./utils/ThemeProvider";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { UnifiedTransactionProvider } from "./components/Transaction/UnifiedTransactionProvider";
import { NotificationProvider } from "./utils/notificationUtils";
import AppLayout from "./components/Layout/AppLayout";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <UnifiedTransactionProvider>
            <AppLayout>
              <AppRouter />
            </AppLayout>
          </UnifiedTransactionProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
