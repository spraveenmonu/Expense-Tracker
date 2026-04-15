import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const TOAST_ICONS = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiXCircle,
};

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const Icon = TOAST_ICONS[toast.type] || FiCheckCircle;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      className={`toast ${toast.type}`}
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="toast-icon">
        <Icon />
      </div>
      <div className="toast-text">
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
    </motion.div>
  );
}
