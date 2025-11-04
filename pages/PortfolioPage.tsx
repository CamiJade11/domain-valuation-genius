

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { DetailedValuation } from '../types';
import { getDetailedValuation } from '../services/geminiService';
import { useToast } from '../hooks/useToast';

const PortfolioPage: React.FC = () => {
    const { portfolio, removeValuation, addDetailedValuation } = usePortfolio();
    const navigate = useNavigate();
    const [selectedForDownload, setSelectedForDownload] = useState<string[]>([]);
    const [downloadingType, setDownloadingType] = useState<'all' | 'selected' | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const { showToast } = useToast();

    const handleDelete = (e: React.MouseEvent, domainName: string) => {
        e.stopPropagation();
        removeValuation(domainName);
        showToast('Domain deleted');
    };
    
    const handleToggleDownloadSelection = (domainName: string) => {
        setSelectedForDownload(prev =>
            prev.includes(domainName)
                ? prev.filter(d => d !== domainName)
                : [...prev, domainName]
        );
    };

    const downloadCSV = (data: DetailedValuation[], filename: string) => {
        const headers = [
            "Domain Name", "Current Value (USD)",
            "3-Month Est. (USD)", "6-Month Est. (USD)", "12-Month Est. (USD)",
            "Keyword Value", "Search Volume", "Sales History", "Market Trend",
            "Growth Opportunity (1-10)"
        ];
        const rows = data.map(item => [
            `"${item.domainName}"`,
            item.currentValue,
            item.futureProjections.threeMonth,
            item.futureProjections.sixMonth,
            item.futureProjections.twelveMonth,
            `"${item.coreInfluencers.keywordValue}"`,
            `"${item.coreInfluencers.searchVolume}"`,
            `"${item.coreInfluencers.salesHistory}"`,
            `"${item.coreInfluencers.marketTrend}"`,
            item.growthPotential.opportunity
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = async (type: 'all' | 'selected') => {
        if (type === 'selected' && selectedForDownload.length === 0) {
            showToast("Please select at least one item to download.", "error");
            return;
        }

        setDownloadingType(type);
        try {
            const dataToProcess = type === 'all'
                ? portfolio
                : portfolio.filter(item => selectedForDownload.includes(item.domainName));

            if (dataToProcess.length === 0) {
                showToast("No items to download.", "error");
                return;
            }
            
            const promises = dataToProcess.map(item => {
                const needsFetching = item.futureProjections.threeMonth === 0 && item.futureProjections.sixMonth === 0;
                if (needsFetching) {
                    return getDetailedValuation(item.domainName).then(detailedData => {
                        addDetailedValuation(detailedData);
                        return detailedData;
                    });
                }
                return Promise.resolve(item);
            });

            const detailedDataToDownload = await Promise.all(promises);
            downloadCSV(detailedDataToDownload, `domain_portfolio_report_${new Date().toISOString().slice(0,10)}.csv`);

        } catch (error) {
            console.error("Failed to download detailed report:", error);
            showToast("An error occurred while fetching detailed data for the report.", "error");
        } finally {
            setDownloadingType(null);
        }
    };
    
    const handleCompare = async () => {
        if (selectedForDownload.length < 2) {
            showToast("Please select at least two items to compare.", "error");
            return;
        }
        setIsComparing(true);
        try {
            const dataToProcess = portfolio.filter(item => selectedForDownload.includes(item.domainName));
            
            const promises = dataToProcess.map(item => {
                const needsFetching = item.futureProjections.threeMonth === 0 && item.futureProjections.sixMonth === 0;
                if (needsFetching) {
                    return getDetailedValuation(item.domainName).then(detailedData => {
                        addDetailedValuation(detailedData);
                        return detailedData;
                    });
                }
                return Promise.resolve(item);
            });
    
            const detailedDataToCompare = await Promise.all(promises);
            navigate('/compare', { state: { domainsToCompare: detailedDataToCompare } });
    
        } catch (error) {
            console.error("Failed to fetch data for comparison:", error);
            showToast("An error occurred while preparing data for comparison.", "error");
        } finally {
            setIsComparing(false);
        }
    };


    if (portfolio.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 pb-28 text-center">
                <div className="flex flex-col items-center gap-8">
                    <img
                        className="h-48 w-48 object-cover opacity-70"
                        alt="A delicate and minimalist line art illustration of a flower"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5WrSBrotoK6npjxMzXyxtbyQlPkq6n4ydvS0Rrp_Tw8QQSDo2XsDWXPtsuVsnkhdedPyW7rVcwad9YgG0p8LFQQhzDXBxf1jHE0mpftsbEvONg33hjSOkp1dbnTNeAgl8vK4X5ZZnKK15HeQawQn8tw3s7ChSFkXTItk6kih9nTBnX-Jt7ECVq7EPwn9V_7Lc0fqjK7kThlppJ5GXnxGBYbz1pD406jyHOozMFKC47nyx04xELJk6MHjpbjCPdhI1mNMzLwBRBwc"
                    />
                    <div className="flex max-w-sm flex-col items-center gap-3">
                        <p className="text-text-primary dark:text-white text-lg font-semibold leading-snug">
                            Your portfolio is empty!
                            <br/><span className="text-base font-normal text-text-secondary dark:text-gray-400">您的投資組合是空的！</span>
                        </p>
                        <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed">
                            Start saving your domain valuations to see them appear here.
                            <br/><span className="text-sm">開始儲存您的域名估價，它們就會顯示在這裡。</span>
                        </p>
                    </div>
                    <button onClick={() => navigate('/')} className="flex h-16 w-full cursor-pointer items-center justify-center rounded-full bg-primary py-4 px-6 text-lg font-bold text-white shadow-soft transition-transform duration-200 ease-in-out hover:scale-105">
                        <div className="text-center">
                            <span>Add New Valuation</span>
                            <br/><span className="text-sm font-normal">新增估價</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pt-16 pb-24">
            <header className="px-4 text-center pb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">My Portfolio</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">我的投資組合</p>
            </header>
            <div className="px-4 pb-4">
                 <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-sm text-blue-800 dark:text-blue-200 mb-4">
                    <span className="material-symbols-outlined text-base">info</span>
                    <span>Portfolio items are saved for 24 hours.</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl bg-primary/10 dark:bg-card-dark border border-primary/20 dark:border-border-dark p-3">
                    <button onClick={() => handleDownload('selected')} disabled={selectedForDownload.length === 0 || downloadingType !== null} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-white dark:bg-zinc-700 text-primary font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {downloadingType === 'selected' ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> :
                            (<>
                                <span className="material-symbols-outlined text-base">download</span>
                                <span className="truncate">Download ({selectedForDownload.length})</span>
                            </>)
                        }
                    </button>
                     <button onClick={() => handleDownload('all')} disabled={downloadingType !== null} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-white dark:bg-zinc-700 text-primary font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {downloadingType === 'all' ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> :
                            (<>
                                <span className="material-symbols-outlined text-base">collections</span>
                                 <span className="truncate">Download All</span>
                            </>)
                        }
                    </button>
                    <button onClick={handleCompare} disabled={selectedForDownload.length < 2 || isComparing} className="col-span-2 sm:col-span-1 flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-white dark:bg-zinc-700 text-primary font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {isComparing ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> :
                            (<>
                                <span className="material-symbols-outlined text-base">compare_arrows</span>
                                <span className="truncate">Compare ({selectedForDownload.length})</span>
                            </>)
                        }
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 px-4">
                {portfolio.map(item => (
                    <div
                        key={item.domainName}
                        className="flex items-center gap-4 rounded-2xl bg-card-light dark:bg-card-dark p-4 shadow-ethereal"
                    >
                        <div className="flex items-center justify-center">
                            <input 
                                type="checkbox"
                                className="form-checkbox h-6 w-6 rounded-md text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                checked={selectedForDownload.includes(item.domainName)}
                                onChange={() => handleToggleDownloadSelection(item.domainName)}
                                aria-label={`Select ${item.domainName} for download`}
                            />
                        </div>

                        <div 
                            onClick={() => navigate(`/portfolio/${item.domainName}`)}
                            className="flex-1 cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="font-display text-text-primary dark:text-white text-lg font-bold leading-tight">{item.domainName}</h3>
                                <p className="text-primary text-lg font-bold whitespace-nowrap pl-2">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.currentValue)}
                                </p>
                            </div>
                            <p className="text-text-secondary dark:text-gray-400 text-xs font-normal mt-1">Click to view detailed report <span className="hidden sm:inline">/ 點擊查看詳細報告</span></p>
                        </div>

                        <button
                            onClick={(e) => handleDelete(e, item.domainName)}
                            className="flex items-center justify-center rounded-full h-9 w-9 text-text-secondary dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            aria-label={`Delete ${item.domainName}`}
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortfolioPage;