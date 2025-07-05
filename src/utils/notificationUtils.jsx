import { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import PropTypes from 'prop-types';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'danger'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'danger': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, addToast }}>
      {children}
      
      {/* Toast Container */}
      <ToastContainer 
        position="top-end" 
        className="p-3"
        style={{ 
          zIndex: 9999,
          top: '80px' // Below navbar
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={toast.duration}
            autohide
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Toast.Header
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                paddingBottom: '8px',
              }}
            >
              <span className="me-2">{getToastIcon(toast.type)}</span>
              <strong className="me-auto">
                {toast.type === 'success' && 'Successo'}
                {toast.type === 'danger' && 'Errore'}
                {toast.type === 'warning' && 'Attenzione'}
                {toast.type === 'info' && 'Informazione'}
              </strong>
            </Toast.Header>
            <Toast.Body style={{ paddingTop: 0 }}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
}; 