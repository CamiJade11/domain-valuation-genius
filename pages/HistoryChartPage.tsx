

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getHistoricalValuation } from '../services/geminiService';
import { HistoricalDataPoint } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import LineChart from '../components/LineChart';
import { usePortfolio } from '../hooks/usePortfolio';

const HistoryChartPage: React.FC = () => {
    const { domainName } = useParams<{ domainName: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { getValuation, updateValuation } = usePortfolio();
    const [historyData, setHistoryData] = useState<HistoricalDataPoint[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!domainName) {
                setError("No domain name provided.");
                setIsLoading(false);
                return;
            }

            const existingItem = getValuation(domainName);
            if (existingItem && existingItem.historicalData) {
                setHistoryData(existingItem.historicalData);
                setIsLoading(false);
                return;
            }

            try {
                const data = await getHistoricalValuation(domainName);
                setHistoryData(data);
                updateValuation(domainName, { historicalData: data }); // Cache the result
            } catch (err) {
                setError("Failed to fetch historical data. Please try again.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [domainName, getValuation, updateValuation]);

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate(domainName ? `/portfolio/${domainName}` : '/portfolio');
        }
    };

    const chartData = historyData ? historyData.map(d => {
        const [month, year] = d.month.split(' ');
        const shortYear = year ? `'${year.slice(-2)}` : '';
        return { label: `${month} ${shortYear}`, value: d.value };
    }) : [];

    return (
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-rose-50/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display text-text-primary dark:text-white text-xl font-bold">Price History</h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400">價格歷史</p>
                </div>
            </header>
            <main className="p-4 pt-2 flex-grow pb-10">
                {isLoading && <LoadingSpinner message={<>Generating historical chart...<br/><span className="text-xs">正在生成歷史圖表...</span></>} />}
                {error && <div className="text-center text-red-500">{error}</div>}
                {historyData && (
                    <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                        <div className="text-center py-4">
                            <p className="text-text-primary dark:text-gray-200 text-lg font-medium">{domainName}</p>
                            <p className="text-text-secondary text-base">12-Month Valuation Trend<br/><span className="text-sm">12個月估價趨勢</span></p>
                        </div>
                        <div className="mt-4">
                            <LineChart data={chartData} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryChartPage;