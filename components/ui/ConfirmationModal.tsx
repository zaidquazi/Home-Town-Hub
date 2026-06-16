import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-neutral-950 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col relative"
        >
          <div className="flex items-start gap-4 p-6">
            <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-900/30 rounded-b-3xl">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading}
              className={isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
