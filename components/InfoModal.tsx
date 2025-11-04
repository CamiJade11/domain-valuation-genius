
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string | null;
    isLoading: boolean;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative w-full max-w-sm m-4 rounded-xl bg-card-light dark:bg-card-dark shadow-soft" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                    <h3 className="font-display text-lg font-bold text-text-primary dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white" aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 min-h-[150px]">
                    {isLoading ? (
                        <LoadingSpinner message={<>Fetching details...<br/><span className="text-xs">正在獲取詳細資訊...</span></>} />
                    ) : (
                        <p className="text-text-secondary dark:text-gray-300 whitespace-pre-wrap">{content}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
