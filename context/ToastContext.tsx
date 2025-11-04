
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };
    
    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        
        setTimeout(() => {
            removeToast(id);
        }, 4000); // Auto-dismiss after 4 seconds
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
