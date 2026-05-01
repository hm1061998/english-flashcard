import React from 'react';
import Modal from '../Modal/Modal';
import Button from '@/components/Button/Button';
import type { ModalOptions } from '../../types';

interface ConfirmModalProps {
  isOpen: boolean;
  options: ModalOptions;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  options, 
  isProcessing, 
  onConfirm, 
  onCancel 
}) => {
  const getHeaderColor = () => {
    switch (options.type) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#4f46e5';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel} 
      title={options.title || 'Xác nhận'}
    >
      <div className="confirm-modal-body">
        <p style={{ 
          fontSize: '1rem', 
          lineHeight: '1.6', 
          color: '#4b5563', 
          margin: '10px 0 25px 0' 
        }}>
          {options.message}
        </p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {options.cancelText && (
            <Button 
              variant="secondary" 
              onClick={onCancel} 
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              {options.cancelText}
            </Button>
          )}
          <Button 
            onClick={onConfirm} 
            disabled={isProcessing}
            style={{ 
              flex: 1, 
              background: getHeaderColor(),
              boxShadow: `0 4px 12px ${getHeaderColor()}33`
            }}
          >
            {isProcessing ? 'Đang xử lý...' : (options.confirmText || 'Xác nhận')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
