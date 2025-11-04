

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBatchValuation } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
    const [domains, setDomains] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const navigate = useNavigate();
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading) {
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isLoading]);

    const handleAppraise = async () => {
        const domainList = domains.split('\n').map(d => d.trim()).filter(d => d.length > 0);
        if (domainList.length === 0) {
            setError('Please enter at least one domain name.');
            return;
        }
        
        setElapsedTime(0);
        setIsLoading(true);
        setError(null);

        try {
            const results = await getBatchValuation(domainList);
            navigate('/results', { state: { results } });
        } catch (err) {
            setError('Failed to appraise domains. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col px-4 pt-16 pb-10">
            <div className="text-center">
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight pb-1">Domain Valuation Genius</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm">域名估價天才</p>
                <p className="text-text-secondary dark:text-gray-300 text-base leading-normal pt-4 pb-6">
                    Real-Time, Data-Driven Domain Appraisal
                    <br/><span className="text-sm">即時數據驅動的域名估價</span>
                </p>
            </div>

            {isLoading ? (
                <LoadingSpinner message={
                    <>
                        Gently analyzing domains with real-time insights...
                        <br/><span className="text-xs">正在以即時洞察力細心分析域名...</span>
                        <br/><br/><span className="text-xs text-gray-500 dark:text-gray-400">Time elapsed: {elapsedTime} seconds</span>
                    </>
                } />
            ) : (
                <>
                    <div className="w-full max-w-md mx-auto flex-col gap-6 rounded-xl bg-card-light dark:bg-zinc-800 p-6 shadow-soft">
                        <div className="flex flex-wrap items-end gap-4">
                            <label className="flex flex-col min-w-40 flex-1">
                                <textarea
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-text-primary dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base transition-colors"
                                    placeholder={"Enter domains, one per line...\n請輸入域名，每行一個..."}
                                    rows={5}
                                    value={domains}
                                    onChange={(e) => setDomains(e.target.value)}
                                />
                            </label>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex mt-6">
                            <button 
                                onClick={handleAppraise}
                                className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-16 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                <div className="text-center">
                                    <span className="truncate">Appraise Domains</span>
                                    <br/><span className="text-xs font-normal">評估域名</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto bg-primary/5 dark:bg-card-dark border border-primary/10 dark:border-border-dark/80 rounded-lg p-3 mt-6 text-center">
                        Our AI analyzes keyword value, market trends, and comparable sales to provide accurate valuations.
                        <br/>我們的人工智慧分析關鍵字價值、市場趨勢和可比銷售，以提供準確的估價。
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;