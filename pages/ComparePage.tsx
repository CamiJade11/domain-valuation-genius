
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailedValuation } from '../types';

const ComparePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { domainsToCompare } = (location.state as { domainsToCompare: DetailedValuation[] }) || { domainsToCompare: [] };

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/portfolio');
        }
    };

    if (!domainsToCompare || domainsToCompare.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                 <h1 className="font-display text-3xl font-bold tracking-tight pb-1">Nothing to Compare</h1>
                 <p className="text-text-secondary dark:text-gray-400 text-sm">無可比較</p>
                 <p className="text-text-secondary dark:text-gray-300 pt-4 pb-8">No domains were selected for comparison.
                    <br/><span className="text-sm">未選擇要比較的域名。</span>
                 </p>
                 <button onClick={handleBack} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-16 px-5 bg-primary text-white text-base font-bold shadow-soft hover:opacity-90 transition-opacity">
                    <div className="text-center">
                        <span>Go Back</span>
                        <br/><span className="text-xs font-normal">返回</span>
                    </div>
                 </button>
            </div>
        );
    }
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    
    const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);

    const metrics = [
        { label: 'Current Value', zh_label: '目前價值', path: 'currentValue', type: 'currency' },
        { label: '3-Month Est.', zh_label: '三個月預估', path: 'futureProjections.threeMonth', type: 'currency' },
        { label: '6-Month Est.', zh_label: '六個月預估', path: 'futureProjections.sixMonth', type: 'currency' },
        { label: '12-Month Est.', zh_label: '十二個月預估', path: 'futureProjections.twelveMonth', type: 'currency' },
        { label: 'Keyword Value', zh_label: '關鍵字價值', path: 'coreInfluencers.keywordValue' },
        { label: 'Search Volume', zh_label: '搜尋量', path: 'coreInfluencers.searchVolume' },
        { label: 'Sales History', zh_label: '銷售歷史', path: 'coreInfluencers.salesHistory' },
        { label: 'Market Trend', zh_label: '市場趨勢', path: 'coreInfluencers.marketTrend' },
        { label: 'Opportunity', zh_label: '機會', path: 'growthPotential.opportunity', suffix: ' / 10' },
    ];

    return (
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-rose-50/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display text-text-primary dark:text-white text-xl font-bold">Compare Domains</h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400">比較域名</p>
                </div>
            </header>
            <main className="flex-grow p-4">
                <div className="overflow-x-auto rounded-xl bg-card-light dark:bg-card-dark shadow-ethereal">
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-border-light dark:border-border-dark">
                            <tr>
                                <th scope="col" className="sticky left-0 bg-card-light dark:bg-card-dark p-4 font-display font-bold text-text-primary dark:text-white">
                                    Metric
                                    <p className="font-normal text-xs text-text-secondary dark:text-gray-400">指標</p>
                                </th>
                                {domainsToCompare.map(d => (
                                    <th scope="col" key={d.domainName} className="p-4 font-semibold text-text-primary dark:text-white whitespace-nowrap">
                                        {d.domainName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map((metric) => (
                                <tr key={metric.path} className="border-b border-border-light dark:border-border-dark last:border-b-0">
                                    <td className="sticky left-0 bg-card-light dark:bg-card-dark p-4 font-semibold text-text-secondary dark:text-gray-300">
                                        {metric.label}
                                        <p className="font-normal text-xs text-text-secondary/80 dark:text-gray-400">{metric.zh_label}</p>
                                    </td>
                                    {domainsToCompare.map(d => {
                                        const value = getNestedValue(d, metric.path);
                                        let displayValue = value;
                                        if(value !== undefined) {
                                            if (metric.type === 'currency') {
                                                displayValue = formatCurrency(value);
                                            } else if (metric.suffix) {
                                                displayValue = `${value}${metric.suffix}`;
                                            }
                                        } else {
                                            displayValue = 'N/A';
                                        }

                                        return (
                                            <td key={d.domainName} className="p-4 text-text-primary dark:text-gray-200 whitespace-nowrap">
                                                {displayValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ComparePage;
