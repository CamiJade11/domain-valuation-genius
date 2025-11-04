
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { BatchValuationResult, DomainAvailability } from '../types';
import { checkDomainAvailability } from '../services/geminiService';
import { useToast } from '../hooks/useToast';

const ResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addValuations } = usePortfolio();
    const { showToast } = useToast();
    const { results: batchResult, fromHistory } = location.state as { results?: BatchValuationResult, fromHistory?: boolean } || {};
    
    const [selectedDomains, setSelectedDomains] = useState<string[]>(batchResult?.valuations.map(v => v.domainName) || []);
    type AvailabilityStatus = {
        loading: boolean;
        result: DomainAvailability | null;
        error: string | null;
    };
    const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});

    if (!batchResult || batchResult.valuations.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                 <h1 className="font-display text-3xl font-bold tracking-tight pb-1">No Results</h1>
                 <p className="text-text-secondary dark:text-gray-400 text-sm">沒有結果</p>
                 <p className="text-text-secondary dark:text-gray-300 pt-4 pb-8">No valuation results were found. Please try again.
                    <br/><span className="text-sm">找不到估價結果。請重試。</span>
                 </p>
                 <button onClick={() => navigate('/')} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-16 px-5 bg-primary text-white text-base font-bold shadow-soft hover:opacity-90 transition-opacity">
                    <div className="text-center">
                        <span>Go Home</span>
                        <br/><span className="text-xs font-normal">返回首頁</span>
                    </div>
                 </button>
            </div>
        )
    }
    
    const { valuations, methodology, resources } = batchResult;
    const allDomains = valuations.map(v => v.domainName);

    const handleToggleSelection = (domainName: string) => {
        if (fromHistory) return; // Disable selection when viewing history
        setSelectedDomains(prev => 
            prev.includes(domainName) 
                ? prev.filter(d => d !== domainName)
                : [...prev, domainName]
        );
    };
    
    const handleSelectAll = () => {
        if (fromHistory) return;
        if (selectedDomains.length === allDomains.length) {
            setSelectedDomains([]); // Deselect all
        } else {
            setSelectedDomains(allDomains); // Select all
        }
    };

    const handleSaveSelected = () => {
        const selectedValuations = valuations.filter(v => selectedDomains.includes(v.domainName));
        if (selectedValuations.length > 0) {
            addValuations(selectedValuations);
            showToast(`${selectedValuations.length} domain(s) saved to portfolio`);
            navigate('/portfolio');
        }
    };

    const handleCheckAvailability = async (domainName: string) => {
        setAvailability(prev => ({ ...prev, [domainName]: { loading: true, result: null, error: null } }));
        try {
            const result = await checkDomainAvailability(domainName);
            setAvailability(prev => ({ ...prev, [domainName]: { loading: false, result, error: null } }));
        } catch (error) {
            setAvailability(prev => ({ ...prev, [domainName]: { loading: false, result: null, error: 'Could not check availability.' } }));
        }
    };
    
    const getRegistrarUrl = (registrar: string | null, domain: string) => {
        const r = registrar?.toLowerCase() || '';
        if (r.includes('godaddy')) {
            return `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain}`;
        }
        if (r.includes('namecheap')) {
            return `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        }
        // Fallback to a generic Google search
        return `https://www.google.com/search?q=buy+domain+${domain}`;
    };

    const renderAvailability = (domainName: string) => {
        const status = availability[domainName];

        if (status?.loading) {
            return <div className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-2 pt-2"><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>Checking...</div>;
        }

        if (status?.error) {
            return <p className="text-xs text-red-500 pt-2">{status.error}</p>;
        }
        
        if (status?.result) {
            if (status.result.available) {
                return (
                     <div className="pt-3 flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Domain appears to be available!</p>
                            {status.result.purchasePrice && (
                                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                                    Est. Price: <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(status.result.purchasePrice)}</span>
                                </p>
                            )}
                         </div>
                         <a 
                            href={getRegistrarUrl(status.result.registrar, domainName)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-primary text-white font-bold py-1 px-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
                         >
                            Buy on {status.result.registrar || 'Registrar'}
                         </a>
                    </div>
                )
            } else {
                return <p className="text-xs text-text-secondary dark:text-gray-400 pt-2">Domain appears to be taken.</p>
            }
        }

        return (
            <button onClick={() => handleCheckAvailability(domainName)} className="text-xs text-primary font-semibold hover:underline mt-2">
                Check Availability
            </button>
        )
    };

    return (
        <div className="flex flex-1 flex-col px-4 pt-16 pb-24">
            <header className="text-center pb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight pb-1">Valuation Results</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm">估價結果</p>
            </header>
            
            <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                 <div className="rounded-xl bg-primary/10 dark:bg-card-dark border border-primary/20 dark:border-border-dark p-4">
                    <h3 className="font-display text-base font-bold text-text-primary dark:text-white mb-3">
                        Valuation Analysis
                        <p className="text-xs font-normal text-text-secondary dark:text-gray-400">估值分析</p>
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-sm text-text-primary dark:text-gray-200">
                                <span className="material-symbols-outlined text-base">checklist</span>
                                Valuation Factors
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-1">{methodology}</p>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-sm text-text-primary dark:text-gray-200">
                                <span className="material-symbols-outlined text-base">database</span>
                                Data Sources
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1 pl-1">
                                {resources.map((res, i) => <li key={i}>{res}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {!fromHistory && (
                     <div className="flex justify-end">
                        <button onClick={handleSelectAll} className="text-sm font-semibold text-primary hover:underline">
                             {selectedDomains.length === allDomains.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                )}

                {valuations.map((result) => (
                    <div 
                        key={result.domainName} 
                        className={`w-full flex-col gap-4 rounded-xl bg-card-light dark:bg-zinc-800 p-4 shadow-ethereal border-2 transition-colors ${selectedDomains.includes(result.domainName) && !fromHistory ? 'border-primary' : 'border-transparent'}`}
                    >
                         <div
                            onClick={() => handleToggleSelection(result.domainName)}
                            className={fromHistory ? 'cursor-default' : 'cursor-pointer'}
                         >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {!fromHistory && (
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-md border-2 ${selectedDomains.includes(result.domainName) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {selectedDomains.includes(result.domainName) && <span className="material-symbols-outlined text-white text-lg">check</span>}
                                        </div>
                                    )}
                                    <span className="font-semibold text-text-primary dark:text-white">{result.domainName}</span>
                                </div>
                                <span className="text-xl font-bold text-text-primary dark:text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(result.estimatedValue)}
                                    <span className="text-base font-medium"> USD</span>
                                </span>
                            </div>
                            <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${!fromHistory ? 'pl-9' : ''}`}>{result.justification}</p>
                         </div>
                         <div className={`mt-2 border-t border-border-light dark:border-border-dark pt-2 ${!fromHistory ? 'pl-9' : ''}`}>
                             {renderAvailability(result.domainName)}
                         </div>
                    </div>
                ))}
            </div>

            {!fromHistory && (
                <div className="fixed bottom-[88px] left-0 right-0 p-4 bg-gradient-to-t from-rose-50 dark:from-background-dark to-transparent">
                    <div className="max-w-md mx-auto">
                        <button 
                            onClick={handleSaveSelected} 
                            disabled={selectedDomains.length === 0}
                            className="w-full h-16 rounded-lg bg-primary text-white font-bold text-base shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             <div className="text-center">
                                <span>Save Selected ({selectedDomains.length})</span>
                                <br/><span className="text-xs font-normal">儲存所選</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;