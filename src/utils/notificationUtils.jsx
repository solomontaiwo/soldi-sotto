import { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const [toasts, setToasts] = useState([]);
  const { t } = useTranslation();

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, "success"), [addToast]);
  const error = useCallback((message) => addToast(message, "danger"), [addToast]);
  const warning = useCallback((message) => addToast(message, "warning"), [addToast]);
  const info = useCallback((message) => addToast(message, "info"), [addToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100";
      case "danger":
        return "border-rose-500/40 bg-rose-500/15 text-rose-900 dark:text-rose-100";
      case "warning":
        return "border-amber-500/40 bg-amber-500/20 text-amber-900 dark:text-amber-100";
      default:
        return "border-border bg-card text-foreground";
    }
  };

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, addToast }}>
      {children}
      <div className="fixed right-4 top-20 z-50 flex w-80 max-w-[90vw] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 text-sm">
                <div className="font-semibold">
                  {toast.type === "success" && t("notifications.success")}
                  {toast.type === "danger" && t("notifications.error")}
                  {toast.type === "warning" && t("notifications.warning")}
                  {toast.type === "info" && t("notifications.info")}
                </div>
                <div>{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
