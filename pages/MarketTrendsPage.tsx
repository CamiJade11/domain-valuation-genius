


import React, { useState, useEffect, useRef } from 'react';
import { getTrendingDomains } from '../services/geminiService';
import { DomainRecommendation, DomainAvailability } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';

type TrendResult = DomainRecommendation & { availability: DomainAvailability };

const MarketTrendsPage: React.FC = () => {
    const [recommendations, setRecommendations] = useState<TrendResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const { addValuations } = usePortfolio();
    const { showToast } = useToast();

    useEffect(() => {
        if (isLoading) {
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isLoading]);

    const handleDiscover = async () => {
        setElapsedTime(0);
        setIsLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            const trendResults = await getTrendingDomains();
            
            if (trendResults.length === 0) {
                 setError("No available trending domains found right now. Try again later!");
            } else {
                 const resultsWithAvailability = trendResults.map(rec => ({
                    ...rec,
                    availability: {
                        available: true,
                        registrar: rec.registrar || null,
                        purchasePrice: null,
                    }
                }));
                setRecommendations(resultsWithAvailability);
            }

        } catch (err) {
            setError('Failed to discover trending domains. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getRegistrarUrl = (registrar: string | null, domain: string) => {
        const r = registrar?.toLowerCase() || '';
        if (r.includes('godaddy')) return `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain}`;
        if (r.includes('namecheap')) return `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        return `https://www.google.com/search?q=buy+domain+${domain}`;
    };

    const handleSaveToPortfolio = (domain: DomainRecommendation) => {
        const valuation = {
            domainName: domain.domainName,
            estimatedValue: domain.estimatedValue,
            justification: domain.reason,
        };
        addValuations([valuation]);
        showToast(`${domain.domainName} saved to portfolio`);
    };

    return (
        <div className="flex-1 flex flex-col pt-16 pb-24">
            <header className="px-4 text-center pb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">Market Trend Analysis</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">市場趨勢分析</p>
                <p className="text-text-secondary dark:text-gray-300 text-base leading-normal pt-4 max-w-sm mx-auto">
                    Our AI analyzes global trends in tech, policy, and finance to recommend available domains poised for growth in the next 6 months.
                    <br/><span className="text-sm">我們的人工智慧分析全球科技、政策和金融趨勢，推薦未來 6 個月內具有增長潛力的可用域名。</span>
                </p>
            </header>
            <main className="flex-grow px-4">
                {!isLoading && recommendations.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center">
                         <div className="flex w-full max-w-sm flex-col items-center gap-3">
                             <button onClick={handleDiscover} className="flex h-16 w-full cursor-pointer items-center justify-center rounded-lg bg-primary py-4 px-6 text-lg font-bold text-white shadow-soft transition-transform duration-200 ease-in-out hover:scale-105">
                                 <div className="text-center">
                                     <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">insights</span>
                                        <span>Discover Trends</span>
                                     </div>
                                     <span className="text-sm font-normal">發現趨勢</span>
                                 </div>
                             </button>
                             {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                         </div>
                    </div>
                )}
                {isLoading && (
                    <LoadingSpinner message={
                        <>
                            Analyzing trends & checking availability...
                            <br/><span className="text-xs">正在分析趨勢並檢查可用性...</span>
                            <br/><br/><span className="text-xs text-gray-500 dark:text-gray-400">Time elapsed: {elapsedTime} seconds</span>
                        </>
                    } />
                )}
                {!isLoading && recommendations.length > 0 && (
                     <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                         {recommendations.map((rec) => (
                             <div key={rec.domainName} className="w-full flex-col gap-4 rounded-xl bg-card-light dark:bg-zinc-800 p-4 shadow-ethereal border border-transparent">
                                 <div>
                                     <div className="flex justify-between items-start">
                                         <span className="font-semibold text-text-primary dark:text-white">{rec.domainName}</span>
                                         <span className="text-xl font-bold text-text-primary dark:text-white">
                                             {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(rec.estimatedValue)}
                                             <span className="text-base font-medium"> USD</span>
                                         </span>
                                     </div>
                                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{rec.reason}</p>
                                 </div>
                                 <div className="mt-2 border-t border-border-light dark:border-border-dark pt-2 flex items-center justify-between">
                                    <a href={getRegistrarUrl(rec.availability.registrar, rec.domainName)} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary text-white font-bold py-1.5 px-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                        Buy Now
                                    </a>
                                     <button onClick={() => handleSaveToPortfolio(rec)} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                                         <span className="material-symbols-outlined text-base">add_circle_outline</span>
                                         Save
                                     </button>
                                 </div>
                             </div>
                         ))}
                         <button onClick={handleDiscover} className="mt-4 flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-16 px-5 flex-1 bg-primary/20 text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                             <div className="text-center">
                                 <span className="truncate">Discover More</span>
                                 <br/><span className="text-xs font-normal">發現更多</span>
                             </div>
                         </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MarketTrendsPage;