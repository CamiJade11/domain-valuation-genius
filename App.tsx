

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import PortfolioPage from './pages/PortfolioPage';
import DetailedPortfolioItemPage from './pages/DetailedPortfolioItemPage';
import BottomNav from './components/BottomNav';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import MonthlyReportsPage from './pages/MonthlyReportsPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import { trackPageView } from './services/analytics';
import SideNav from './components/SideNav';
import ComparePage from './pages/ComparePage';


const App: React.FC = () => {
    return (
        <PortfolioProvider>
            <AuthProvider>
                <ToastProvider>
                    <HashRouter>
                        <MainContent />
                    </HashRouter>
                </ToastProvider>
            </AuthProvider>
        </PortfolioProvider>
    );
};

const MainContent: React.FC = () => {
    const location = useLocation();
    
    useEffect(() => {
        // Track page views on route change
        trackPageView(location.pathname + location.search);
    }, [location]);
    
    const isPortfolioSubPage = location.pathname.startsWith('/portfolio/') && location.pathname !== '/portfolio';
    const hideNavOnPaths = [
        // No paths hide the nav now, but keeping the structure for future flexibility
    ];
    const showBottomNav = !hideNavOnPaths.includes(location.pathname) && !isPortfolioSubPage;

    return (
        <div className="w-full">
            <div className="lg:flex lg:max-w-7xl lg:mx-auto">
                <SideNav />
                <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col overflow-x-hidden bg-rose-50 font-body text-text-primary dark:bg-background-dark dark:text-gray-200 lg:mx-0 lg:max-w-none">
                    <main className="flex-grow flex flex-col">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/results" element={<ResultsPage />} />
                            <Route path="/portfolio" element={<PortfolioPage />} />
                            <Route path="/portfolio/:domainName" element={<DetailedPortfolioItemPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/settings/profile" element={<EditProfilePage />} />
                            <Route path="/reports/monthly" element={<MonthlyReportsPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/compare" element={<ComparePage />} />
                        </Routes>
                    </main>
                    {showBottomNav && <BottomNav />}
                </div>
            </div>
        </div>
    );
}

export default App;