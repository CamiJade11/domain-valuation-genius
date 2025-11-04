import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { BatchValuationResult } from '../types';
import { HistoryItem } from '../context/HistoryContext';

const HistoryPage: React.FC = () => {
    const { history } = useHistory();
    const navigate = useNavigate();

    const handleViewResult = (batchResult: BatchValuationResult) => {
        navigate('/results', { state: { results: batchResult, fromHistory: true } });
    };

    // Fix: By explicitly casting the initial value for `reduce`, we ensure TypeScript correctly infers the accumulator's type, preventing downstream errors.
    const groupedHistory = history.reduce((acc, item) => {
        const date = new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {} as Record<string, HistoryItem[]>);


    if (history.length === 0) {
        return (
             <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 pb-28 text-center">
                <span className="material-symbols-outlined text-7xl text-text-secondary/50 dark:text-gray-600">history</span>
                <p className="text-text-primary dark:text-white text-lg font-semibold leading-snug mt-4">
                    No recent history
                    <br/><span className="text-base font-normal text-text-secondary dark:text-gray-400">沒有最近的歷史記錄</span>
                </p>
                <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed mt-2">
                    Valuations you perform will appear here for 7 days.
                    <br/><span className="text-sm">您執行的估價將在此處顯示 7 天。</span>
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col pt-16 pb-24">
            <header className="px-4 text-center pb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">Valuation History</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">估價歷史</p>
            </header>
            <main className="flex-grow px-4">
                <div className="space-y-6">
                    {/* FIX: Replaced Object.entries with Object.keys to iterate over the grouped history. This resolves a TypeScript error where 'items' was inferred as 'unknown', likely due to an issue with type inference on Object.entries in this environment. */}
                    {Object.keys(groupedHistory).map((date) => (
                        <div key={date}>
                            <h2 className="font-display text-lg font-semibold text-text-primary dark:text-gray-200 px-2 pb-3">{date}</h2>
                            <div className="space-y-3">
                                {groupedHistory[date].map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleViewResult(item.batchResult)}
                                        className="group flex items-center gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-ethereal transition-transform duration-200 ease-in-out active:scale-[0.98] cursor-pointer"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary dark:text-white">
                                            <span className="material-symbols-outlined">pie_chart</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="truncate text-base font-medium text-text-primary dark:text-gray-100">
                                                {item.batchResult.valuations.length} Domain{item.batchResult.valuations.length > 1 ? 's' : ''} Valued
                                            </p>
                                            <p className="text-xs text-text-secondary dark:text-gray-400">
                                                {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-text-secondary dark:text-gray-400">
                                            <span className="material-symbols-outlined text-2xl">chevron_right</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;