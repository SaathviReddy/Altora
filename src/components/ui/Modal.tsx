import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-ivory border border-charcoal/10 rounded shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-charcoal/5">
          <h3 className="text-lg font-serif font-medium text-charcoal">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-brown hover:text-charcoal transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
