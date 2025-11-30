import { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

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

  useEffect(() => {
    if (toasts.length === 0) return;

    const handleInteraction = () => {
      setToasts([]);
    };

    window.addEventListener("scroll", handleInteraction, { capture: true, passive: true });
    window.addEventListener("touchstart", handleInteraction, { capture: true, passive: true });
    window.addEventListener("click", handleInteraction, { capture: true });

    return () => {
      window.removeEventListener("scroll", handleInteraction, { capture: true });
      window.removeEventListener("touchstart", handleInteraction, { capture: true });
      window.removeEventListener("click", handleInteraction, { capture: true });
    };
  }, [toasts]);

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
      <div className="fixed left-1/2 top-6 z-50 flex w-80 max-w-[90vw] -translate-x-1/2 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
