import React, { useEffect, useState } from 'react';
import './ToastItem.less';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItemProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast-item toast-${type} ${isExiting ? 'exit' : ''}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

export default ToastItem;
