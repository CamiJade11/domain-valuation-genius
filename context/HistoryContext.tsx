import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BatchValuationResult } from '../types';

export interface HistoryItem {
    id: string;
    timestamp: number;
    batchResult: BatchValuationResult;
}

interface HistoryContextType {
    history: HistoryItem[];
    addBatchToHistory: (batchResult: BatchValuationResult) => void;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const localData = localStorage.getItem('domainValuationHistory');
            if (!localData) return [];
            const parsedData: HistoryItem[] = JSON.parse(localData);
            
            // Filter out items older than 7 days
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return parsedData.filter(item => item.timestamp >= sevenDaysAgo);
        } catch (error) {
            console.error("Error reading history from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('domainValuationHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Error saving history to localStorage", error);
        }
    }, [history]);

    const addBatchToHistory = (batchResult: BatchValuationResult) => {
        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            batchResult,
        };
        setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    };

    return (
        <HistoryContext.Provider value={{ history, addBatchToHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};
