

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { DetailedValuation, Valuation, HistoricalDataPoint } from '../types';

type PortfolioItem = DetailedValuation & { 
    savedAt: number;
    historicalData?: HistoricalDataPoint[];
};

interface PortfolioContextType {
    portfolio: PortfolioItem[];
    addValuations: (valuations: Valuation[]) => void;
    addDetailedValuation: (valuation: DetailedValuation) => void;
    getValuation: (domainName: string) => PortfolioItem | undefined;
    updateValuation: (domainName: string, updatedData: Partial<PortfolioItem>) => void;
    removeValuation: (domainName: string) => void;
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
        try {
            const localData = localStorage.getItem('domainPortfolio');
            if (!localData) return [];
            const parsedData: PortfolioItem[] = JSON.parse(localData);

            // Filter out items older than 24 hours
            const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
            return parsedData.filter(item => item.savedAt && item.savedAt >= twentyFourHoursAgo);
        } catch (error) {
            console.error("Error reading portfolio from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('domainPortfolio', JSON.stringify(portfolio));
        } catch (error) {
            console.error("Error saving portfolio to localStorage", error);
        }
    }, [portfolio]);

    const addValuations = (valuations: Valuation[]) => {
        setPortfolio(prevPortfolio => {
            const newPortfolio = [...prevPortfolio];
            valuations.forEach(v => {
                if (!newPortfolio.some(p => p.domainName === v.domainName)) {
                    // This is a simplified conversion. For full details, a new API call is needed.
                    // For now, we'll add it with partial data and fetch details on demand.
                    newPortfolio.push({ 
                        domainName: v.domainName, 
                        currentValue: v.estimatedValue,
                        // Add placeholder for other fields
                        futureProjections: { threeMonth: 0, sixMonth: 0, twelveMonth: 0 },
                        coreInfluencers: { keywordValue: '', searchVolume: '', salesHistory: '', marketTrend: '' },
                        growthPotential: { opportunity: 0 },
                        savedAt: Date.now()
                    });
                }
            });
            return newPortfolio;
        });
    };

    const addDetailedValuation = (valuation: DetailedValuation) => {
        const itemWithTimestamp = { ...valuation, savedAt: Date.now() };
        setPortfolio(prev => {
            const index = prev.findIndex(p => p.domainName === valuation.domainName);
            if (index > -1) {
                const updatedPortfolio = [...prev];
                // Preserve historical data if it exists
                const existingHistory = updatedPortfolio[index].historicalData;
                updatedPortfolio[index] = { ...itemWithTimestamp, historicalData: existingHistory };
                return updatedPortfolio;
            }
            return [...prev, itemWithTimestamp];
        });
    };
    
    const updateValuation = (domainName: string, updatedData: Partial<PortfolioItem>) => {
        setPortfolio(prev => 
            prev.map(item => 
                item.domainName === domainName ? { ...item, ...updatedData } : item
            )
        );
    };

    const removeValuation = (domainName: string) => {
        setPortfolio(prev => prev.filter(item => item.domainName !== domainName));
    };

    const getValuation = (domainName: string) => {
        return portfolio.find(item => item.domainName === domainName);
    };

    return (
        <PortfolioContext.Provider value={{ portfolio, addValuations, addDetailedValuation, getValuation, updateValuation, removeValuation }}>
            {children}
        </PortfolioContext.Provider>
    );
};