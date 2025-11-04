
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LineChart from '../components/LineChart';

const dummyData = [
    { label: "Jan '24", value: 12500 },
    { label: "Feb '24", value: 13200 },
    { label: "Mar '24", value: 12800 },
    { label: "Apr '24", value: 14500 },
    { label: "May '24", value: 15100 },
    { label: "Jun '24", value: 16200 },
    { label: "Jul '24", value: 15800 },
];

const MonthlyReportsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-rose-50/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-display text-text-primary dark:text-white text-xl font-bold">Monthly Reports</h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400">每月報告</p>
                </div>
            </header>
            <main className="p-4 pt-2 flex-grow pb-10">
                <div className="flex w-full flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-ethereal">
                    <div className="text-center py-4">
                        <p className="text-text-primary dark:text-gray-200 text-lg font-medium">Portfolio Performance</p>
                        <p className="text-text-secondary text-base">YTD Total Value<br/><span className="text-sm">年初至今總價值</span></p>
                    </div>
                    <div className="mt-4">
                        <LineChart data={dummyData} />
                    </div>
                     <div className="mt-8 text-center">
                        <p className="text-text-secondary dark:text-gray-400 text-sm">More detailed reports and insights will be available here soon.</p>
                     </div>
                </div>
            </main>
        </div>
    );
};

export default MonthlyReportsPage;
