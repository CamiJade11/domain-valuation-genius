
import React from 'react';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const flowerIconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC5WrSBrotoK6npjxMzXyxtbyQlPkq6n4ydvS0Rrp_Tw8QQSDo2XsDWXPtsuVsnkhdedPyW7rVcwad9YgG0p8LFQQhzDXBxf1jHE0mpftsbEvONg33hjSOkp1dbnTNeAgl8vK4X5ZZnKK15HeQawQn8tw3s7ChSFkXTItk6kih9nTBnX-Jt7ECVq7EPwn9V_7Lc0fqjK7kThlppJ5GXnxGBYbz1pD406jyHOozMFKC47nyx04xELJk6MHjpbjCPdhI1mNMzLwBRBwc";

    return (
        <div 
            className="flex items-center gap-4 w-full max-w-sm p-4 rounded-xl shadow-soft bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark animate-fade-in-up"
            role="alert"
        >
            <div className="flex-shrink-0">
                <img
                    className="h-8 w-8 object-cover"
                    alt="Success Icon"
                    src={flowerIconUrl}
                />
            </div>
            <div className="flex-1 text-sm font-medium text-text-primary dark:text-gray-200">
                {message}
            </div>
            <button
                onClick={onDismiss}
                className="text-text-secondary/70 dark:text-gray-400 hover:text-text-primary dark:hover:text-white"
                aria-label="Close"
            >
                <span className="material-symbols-outlined text-xl">close</span>
            </button>
        </div>
    );
};


interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full px-4">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
