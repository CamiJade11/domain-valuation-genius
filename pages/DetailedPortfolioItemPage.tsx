


import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { getDetailedValuation, getInfluencerExplanation, getDomainRecommendations, checkDomainAvailability } from '../services/geminiService';
import { DetailedValuation, DomainRecommendation, DomainAvailability } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoModal from '../components/InfoModal';

type AvailabilityStatus = {
    loading: boolean;
    result: DomainAvailability | null;
    error: string | null;
};

const ESTIMATED_DURATION = 12; // Estimate for detailed report generation

const StatRow: React.FC<{ label: string; zh_label: string; value: string | number; currency?: boolean, onInfoClick?: () => void }> = ({ label, zh_label, value, currency = false, onInfoClick }) => (
    <div className="flex justify-between items-center gap-x-6 py-2">
        <div className="flex items-center gap-2">
            <p className="text-text-secondary dark:text-gray-400 text-sm">{label}<br/><span className="text-xs">{zh_label}</span></p>
            {onInfoClick && (
                 <button onClick={onInfoClick} className="text-text-secondary/70 dark:text-gray-500 hover:text-primary -mb-3">
                    <span className="material-symbols-outlined text-base">info</span>
                </button>
            )}
        </div>
        <p className="text-text-primary dark:text-gray-200 text-sm font-medium text-right">
            {currency ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value))} USD` : value}
        </p>
    </div>
);

const ProgressBar: React.FC<{ label: string; zh_label: string; score: number; maxScore: number; color: string; rating: string; }> = ({ label, zh_label, score, maxScore, color, rating }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <p className="text-text-secondary dark:text-gray-400 text-sm">{label}<br/><span className="text-xs">{zh_label}</span></p>
            <p className={`text-sm font-medium`} style={{color: color}}>{score}/{maxScore} {rating}</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="h-2 rounded-full" style={{ width: `${(score / maxScore) * 100}%`, backgroundColor: color }}></div>
        </div>
    </div>
);


const DetailedPortfolioItemPage: React.FC = () => {
    const { domainName } = useParams<{ domainName: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { getValuation, addDetailedValuation } = usePortfolio();
    const [details, setDetails] = useState<DetailedValuation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(ESTIMATED_DURATION);
    const timerRef = useRef<number | null>(null);
    const [recommendations, setRecommendations] = useState<DomainRecommendation[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(true);
    const [recAvailability, setRecAvailability] = useState<Record<string, AvailabilityStatus>>({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [isModalLoading, setIsModalLoading] = useState(false);

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/portfolio');
        }
    };

    const handleInfoClick = async (influencer: string, value: string) => {
        if (!details) return;
        setModalTitle(`About ${influencer}`);
        setIsModalOpen(true);
        setIsModalLoading(true);
        setModalContent(null);
        try {
            const explanation = await getInfluencerExplanation(details.domainName, influencer, value);
            setModalContent(explanation);
        } catch (e) {
            setModalContent("Sorry, we couldn't fetch an explanation at this time.");
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleCloseModal = () => setIsModalOpen(false);

    useEffect(() => {
        if (isLoading) {
            timerRef.current = window.setInterval(() => {
                setCountdown(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
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

    useEffect(() => {
        const fetchAllData = async () => {
            if (!domainName) return;

            // Reset states for the new fetch
            setIsLoading(true);
            setCountdown(ESTIMATED_DURATION);
            
            const fetchDetails = async () => {
                const existingData = getValuation(domainName);
                if (existingData && existingData.futureProjections.threeMonth > 0) {
                    setDetails(existingData);
                    return existingData;
                }
                const freshData = await getDetailedValuation(domainName);
                addDetailedValuation(freshData);
                setDetails(freshData);
                return freshData;
            };

            const fetchRecs = async (currentDomain: DetailedValuation) => {
                setIsLoadingRecs(true);
                try {
                    const recs = await getDomainRecommendations(currentDomain.domainName, currentDomain.currentValue);
                    setRecommendations(recs);
                } catch (e) {
                    console.error("Failed to fetch recommendations", e);
                } finally {
                    setIsLoadingRecs(false);
                }
            };
            
            try {
                const domainDetails = await fetchDetails();
                if(domainDetails) {
                    await fetchRecs(domainDetails);
                }
            } catch (error) {
                console.error("Failed to fetch page data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [domainName, getValuation, addDetailedValuation]);

    const handleCheckRecAvailability = async (domain: string) => {
        setRecAvailability(prev => ({ ...prev, [domain]: { loading: true, result: null, error: null } }));
        try {
            const result = await checkDomainAvailability(domain);
            setRecAvailability(prev => ({ ...prev, [domain]: { loading: false, result, error: null } }));
        } catch (error) {
            setRecAvailability(prev => ({ ...prev, [domain]: { loading: false, result: null, error: 'Could not check availability.' } }));
        }
    };
    
    const getRegistrarUrl = (registrar: string | null, domain: string) => {
        const r = registrar?.toLowerCase() || '';
        if (r.includes('godaddy')) return `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain}`;
        if (r.includes('namecheap')) return `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        return `https://www.google.com/search?q=buy+domain+${domain}`;
    };

    const renderRecAvailability = (domain: string) => {
        const status = recAvailability[domain];

        if (status?.loading) {
            return <div className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-2 pt-2"><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>Checking...</div>;
        }
        if (status?.error) return <p className="text-xs text-red-500 pt-2">{status.error}</p>;
        
        if (status?.result) {
            if (status.result.available) {
                return (
                    <div className="pt-3 flex items-center gap-2">
                         <p className="text-xs text-green-600 dark:text-green-400 font-medium">Domain appears to be available!</p>
                         <a href={getRegistrarUrl(status.result.registrar, domain)} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary text-white font-bold py-1 px-3 rounded-full hover:opacity-90 transition-opacity">
                            Buy on {status.result.registrar || 'Registrar'}
                         </a>
                    </div>
                );
            }
            return <p className="text-xs text-text-secondary dark:text-gray-400 pt-2">Domain appears to be taken.</p>;
        }

        return <button onClick={() => handleCheckRecAvailability(domain)} className="text-xs text-primary font-semibold hover:underline mt-2">Check Availability</button>;
    };

    const portfolioItem = domainName ? getValuation(domainName) : undefined;
    const lastUpdated = portfolioItem ? new Date(portfolioItem.savedAt).toLocaleString() : null;

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner message={
                <>
                    Gently preparing your in-depth report...
                    <br/><span className="text-xs">正在精心準備您的深度報告...</span>
                    <br/><br/>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {countdown > 0
                            ? `Estimated time remaining: ${countdown} seconds`
                            : `Finalizing results, just a moment...`}
                    </span>
                </>
            } />
        </div>
    );
    if (!details) return <div className="flex-1 flex items-center justify-center text-center p-4">Could not load valuation details for {domainName}.</div>;
    
    return (
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-rose-50/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display text-text-primary dark:text-white text-xl font-bold">Valuation Result</h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400">估價結果</p>
                </div>
            </header>
            <main className="p-4 pt-2 flex-grow pb-10 space-y-4">
                <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <div className="text-center py-4">
                        <p className="text-text-secondary text-base">Current Estimated Value<br/><span className="text-sm">目前估計價值</span></p>
                        <p className="text-5xl font-bold tracking-tighter text-primary">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(details.currentValue)}
                            <span className="text-3xl"> USD</span>
                        </p>
                        <p className="text-text-primary dark:text-gray-200 text-lg font-medium pt-1">{details.domainName}</p>
                        {lastUpdated && (
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">
                                Last updated: {lastUpdated}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-border-light dark:bg-border-dark my-4"></div>

                    <div className="flex flex-col gap-8">
                        <section>
                            <h3 className="flex items-center gap-2 mb-3 font-display text-lg font-bold"><span className="material-symbols-outlined text-text-secondary">trending_up</span>
                                <div>Future Pathways<p className="text-xs font-normal text-text-secondary dark:text-gray-400">未來途徑</p></div>
                            </h3>
                            <StatRow label="3-Month Est." zh_label="三個月預估" value={details.futureProjections.threeMonth} currency />
                            <StatRow label="6-Month Est." zh_label="六個月預估" value={details.futureProjections.sixMonth} currency />
                            <StatRow label="12-Month Est." zh_label="十二個月預估" value={details.futureProjections.twelveMonth} currency />
                        </section>
                        <section>
                             <h3 className="flex items-center gap-2 mb-3 font-display text-lg font-bold"><span className="material-symbols-outlined text-text-secondary">search</span>
                                <div>Core Influencers<p className="text-xs font-normal text-text-secondary dark:text-gray-400">核心影響因素</p></div>
                             </h3>
                             <StatRow label="Keyword Value" zh_label="關鍵字價值" value={details.coreInfluencers.keywordValue} onInfoClick={() => handleInfoClick("Keyword Value", details.coreInfluencers.keywordValue)} />
                             <StatRow label="Search Volume" zh_label="搜尋量" value={details.coreInfluencers.searchVolume} onInfoClick={() => handleInfoClick("Search Volume", details.coreInfluencers.searchVolume)} />
                             <StatRow label="Sales History" zh_label="銷售歷史" value={details.coreInfluencers.salesHistory} onInfoClick={() => handleInfoClick("Sales History", details.coreInfluencers.salesHistory)} />
                             <StatRow label="Market Trend" zh_label="市場趨勢" value={details.coreInfluencers.marketTrend} onInfoClick={() => handleInfoClick("Market Trend", details.coreInfluencers.marketTrend)} />
                        </section>
                        <section>
                            <h3 className="flex items-center gap-2 mb-3 font-display text-lg font-bold"><span className="material-symbols-outlined text-text-secondary">star</span>
                                <div>Growth Potential<p className="text-xs font-normal text-text-secondary dark:text-gray-400">增長潛力</p></div>
                            </h3>
                            <div className="flex flex-col gap-4">
                                <ProgressBar label="Opportunity" zh_label="機會" score={details.growthPotential.opportunity} maxScore={10} color="#66BB6A" rating="Exceptional" />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="w-full rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <h3 className="flex items-center gap-2 mb-2 font-display text-lg font-bold">
                        <span className="material-symbols-outlined text-text-secondary">auto_awesome</span>
                        <div>AI-Powered Recommendations<p className="text-xs font-normal text-text-secondary dark:text-gray-400">AI 推薦</p></div>
                    </h3>
                    <p className="text-xs italic text-text-secondary/80 dark:text-gray-500 mb-4">
                        *We are not affiliated with any registrars and do not receive commissions for purchases.
                    </p>
                    {isLoadingRecs ? <LoadingSpinner message="Finding similar high-value domains..." /> :
                        recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.map(rec => (
                                    <div key={rec.domainName} className="border-t border-border-light dark:border-border-dark pt-4 first:border-t-0 first:pt-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-text-primary dark:text-white">{rec.domainName}</span>
                                            <span className="text-lg font-bold text-text-primary dark:text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(rec.estimatedValue)}
                                                <span className="text-sm font-medium"> USD</span>
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{rec.reason}</p>
                                        <div className="mt-2 border-t border-border-light dark:border-border-dark pt-2">
                                            {renderRecAvailability(rec.domainName)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-text-secondary dark:text-gray-400">No high-value alternatives found at this time.</p>
                        )
                    }
                </div>
            </main>
            <InfoModal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle} content={modalContent} isLoading={isModalLoading} />
        </div>
    );
};

export default DetailedPortfolioItemPage;