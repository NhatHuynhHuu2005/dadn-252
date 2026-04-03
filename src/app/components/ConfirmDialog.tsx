import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Xac nhan', variant = 'danger' }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="confirm-content">
        <div className={`confirm-icon ${variant}`}>
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center">Huy</button>
          <button
            onClick={onConfirm}
            className={`flex-1 justify-center ${variant === 'danger' ? 'btn-primary !bg-red-600 !shadow-red-200' : 'btn-primary !bg-amber-500 !shadow-amber-200'}`}
            style={variant === 'danger' ? { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' } : { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
