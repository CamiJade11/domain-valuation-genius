import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/settings');
        }
    };
    
    return (
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-rose-50/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display text-text-primary dark:text-white text-xl font-bold">About This App</h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400">關於此應用程式</p>
                </div>
            </header>
            <main className="p-4 pt-2 flex-grow pb-10 space-y-4">
                <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <h2 className="text-xl font-bold font-display text-text-primary dark:text-white">Our Mission</h2>
                    <p className="text-text-secondary dark:text-gray-400 mt-1">我們的使命</p>
                    <div className="h-px bg-border-light dark:bg-border-dark my-4"></div>
                    <div className="space-y-4 text-text-secondary dark:text-gray-300 leading-relaxed">
                        <p>
                            Domain investors and tech entrepreneurs waste thousands on bad domain purchases, while leaving money on the table when selling valuable ones. Current appraisal tools are wildly inconsistent, outdated, and give little transparency into how values are calculated.
                        </p>
                        <p>
                            <strong>Domain Valuation Genius</strong> uses machine learning to analyze millions of historical sales, market trends, keyword value, and search volume to deliver accurate, real-time domain appraisals.
                        </p>
                        <p>
                            網域投資者和科技企業家在買賣網域時常因估價不準確而蒙受損失。現有的網域估價工具被認為不一致、過時且缺乏透明度。<strong>Domain Valuation Genius</strong> 是一款運用機器學習技術的網域估價工具。此工具透過分析歷史銷售數據、市場趨勢、關鍵字價值和搜尋量來提供準確的即時估價。
                        </p>
                    </div>
                </div>

                <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <h2 className="text-xl font-bold font-display text-text-primary dark:text-white">Creator & Support</h2>
                    <p className="text-text-secondary dark:text-gray-400 mt-1">創作者與支持</p>
                    <div className="h-px bg-border-light dark:bg-border-dark my-4"></div>
                     <p className="text-text-secondary dark:text-gray-300 leading-relaxed text-center">
                        Designed & built by{' '}
                        <a
                            href="https://linktr.ee/alohaintw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            CamiJade <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                        . If you find this app useful, please consider{' '}
                        <a
                            href="https://buymeacoffee.com/alohaintw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            buying me a coffee <span className="material-symbols-outlined text-sm">coffee</span>
                        </a>!
                    </p>
                </div>

                <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <h2 className="text-xl font-bold font-display text-text-primary dark:text-white">Disclaimer</h2>
                    <p className="text-text-secondary dark:text-gray-400 mt-1">免責聲明</p>
                    <div className="h-px bg-border-light dark:bg-border-dark my-4"></div>
                    <div className="space-y-4 text-text-secondary dark:text-gray-300 leading-relaxed text-sm">
                        <p>
                           Valuations are AI-generated estimates for informational purposes only and do not constitute financial advice. We do not guarantee accuracy. Please conduct your own research before making any investment decisions.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AboutPage;