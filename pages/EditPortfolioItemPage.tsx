
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { getDetailedValuation } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const EditPortfolioItemPage: React.FC = () => {
    const { domainName } = useParams<{ domainName: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { getValuation, updateValuation, addDetailedValuation } = usePortfolio();
    
    const [currentValue, setCurrentValue] = useState('');
    const [isReappraising, setIsReappraising] = useState(false);
    
    useEffect(() => {
        if (domainName) {
            const valuation = getValuation(domainName);
            if (valuation) {
                setCurrentValue(valuation.currentValue.toString());
            } else {
                navigate('/portfolio');
            }
        }
    }, [domainName, getValuation, navigate]);

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate(domainName ? `/portfolio/${domainName}` : '/portfolio');
        }
    };

    const handleSave = () => {
        if (domainName) {
            updateValuation(domainName, { currentValue: Number(currentValue) });
            navigate(`/portfolio/${domainName}`);
        }
    };

    const handleReappraise = async () => {
        if (!domainName) return;
        setIsReappraising(true);
        try {
            const freshData = await getDetailedValuation(domainName);
            addDetailedValuation(freshData);
            navigate(`/portfolio/${domainName}`);
        } catch (error) {
            console.error("Failed to re-appraise domain", error);
        } finally {
            setIsReappraising(false);
        }
    };
    
    if (!domainName) {
        return <div className="flex flex-1 items-center justify-center">Domain not found.</div>;
    }

    return (
        <div className="flex-1 flex flex-col font-nunito">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center text-text-primary dark:text-white">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                    <h1 className="font-display text-lg font-bold text-text-primary dark:text-white">Edit Valuation</h1>
                    <p className="text-xs text-text-secondary dark:text-gray-400">編輯估價</p>
                </div>
            </header>
            <main className="flex-1 px-4 pt-4 pb-10">
                { isReappraising ? (
                    <LoadingSpinner message={
                        <>
                            Re-appraising {domainName}...
                            <br/><span className="text-xs">正在重新評估 {domainName}...</span>
                        </>
                    } />
                ) : (
                    <div className="flex w-full flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col">
                                <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Domain Name <span className="font-normal text-sm text-text-secondary dark:text-gray-400">域名</span></p>
                                <input 
                                    className="form-input h-14 w-full rounded-lg border border-border-light bg-gray-100 p-4 text-text-secondary dark:border-border-dark dark:bg-card-dark/50 dark:text-gray-400" 
                                    value={domainName} 
                                    disabled 
                                />
                            </label>
                            <label className="flex flex-col">
                                <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Current Estimated Value <span className="font-normal text-sm text-text-secondary dark:text-gray-400">目前估計價值</span></p>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary dark:text-gray-400">$</span>
                                    <input 
                                        className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 pl-8 pr-12 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" 
                                        type="number"
                                        value={currentValue}
                                        onChange={(e) => setCurrentValue(e.target.value)}
                                        aria-label="Current Estimated Value"
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary dark:text-gray-400 font-semibold">USD</span>
                                </div>
                            </label>
                        </div>
                        <button 
                            onClick={handleSave}
                            className="mt-4 flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-base font-bold tracking-[0.015em] shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]"
                        >
                             <div className="text-center">
                                <span className="truncate">Save Changes</span>
                                <br/><span className="text-xs font-normal">儲存變更</span>
                            </div>
                        </button>
                        
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                            <span className="flex-shrink mx-4 text-text-secondary dark:text-gray-400">Or <span className="text-xs">或</span></span>
                            <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                        </div>
                        
                        <button 
                            onClick={handleReappraise}
                            className="flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-primary border-2 border-primary text-base font-bold tracking-[0.015em] transition-transform active:scale-[0.98] hover:bg-primary/10"
                        >
                            <div className="text-center">
                                <span className="truncate">Re-appraise with AI</span>
                                <br/><span className="text-xs font-normal">使用 AI 重新評估</span>
                            </div>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EditPortfolioItemPage;