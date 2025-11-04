
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SettingsItem: React.FC<{ icon: string; label: string; zh_label: string; onClick?: () => void; isDestructive?: boolean }> = ({ icon, label, zh_label, onClick, isDestructive = false }) => (
    <div
        onClick={onClick}
        className={`group flex items-center gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-ethereal transition-transform duration-200 ease-in-out active:scale-[0.98] cursor-pointer`}
    >
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${isDestructive ? 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' : 'bg-primary/20 text-primary dark:text-white'}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1">
            <p className={`truncate text-base font-medium ${isDestructive ? 'text-red-500 dark:text-red-400' : 'text-text-primary dark:text-gray-100'}`}>{label}</p>
            <p className={`text-xs ${isDestructive ? 'text-red-400/80' : 'text-text-secondary dark:text-gray-400'}`}>{zh_label}</p>
        </div>
        {!isDestructive && (
             <div className="shrink-0 text-text-secondary dark:text-gray-400">
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
            </div>
        )}
    </div>
);


const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isLoggedIn) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <span className="material-symbols-outlined text-7xl text-primary/50">lock</span>
                 <p className="text-text-primary dark:text-white text-lg font-semibold leading-snug mt-4">
                    Create an Account
                    <br/><span className="text-base font-normal text-text-secondary dark:text-gray-400">建立帳戶</span>
                </p>
                <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed mt-2 max-w-sm">
                   Create a free account to save your portfolio and access monthly performance reports.
                   <br/><span className="text-sm">建立免費帳戶以儲存您的投資組合並存取每月績效報告。</span>
                </p>
                <button onClick={() => navigate('/login')} className="mt-8 flex h-16 w-full max-w-sm cursor-pointer items-center justify-center rounded-lg bg-primary py-4 px-6 text-lg font-bold text-white shadow-soft transition-transform duration-200 ease-in-out hover:scale-105">
                    <div className="text-center">
                        <span>Login or Sign Up</span>
                        <br/><span className="text-sm font-normal">登入或註冊</span>
                    </div>
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col pt-16 pb-24">
            <header className="px-4 text-center pb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">設定</p>
            </header>
            <main className="flex-grow px-4">
                 <div className="space-y-6">
                    <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary dark:text-gray-200 px-2 pb-3">Account <span className="font-normal text-base text-text-secondary dark:text-gray-400">帳戶</span></h2>
                        <SettingsItem icon="person" label="Profile Settings" zh_label="個人資料設定" onClick={() => navigate('/settings/profile')} />
                    </div>
                     <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary dark:text-gray-200 px-2 pb-3">Reports <span className="font-normal text-base text-text-secondary dark:text-gray-400">報告</span></h2>
                        <SettingsItem icon="assessment" label="Monthly Reports" zh_label="每月報告" onClick={() => navigate('/reports/monthly')} />
                    </div>
                     <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary dark:text-gray-200 px-2 pb-3">Preferences <span className="font-normal text-base text-text-secondary dark:text-gray-400">偏好設定</span></h2>
                        <div className="space-y-3">
                            <SettingsItem icon="notifications" label="Notification Preferences" zh_label="通知偏好設定" />
                            <SettingsItem icon="palette" label="App Theme" zh_label="應用程式主題" />
                        </div>
                    </div>
                     <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary dark:text-gray-200 px-2 pb-3">Support <span className="font-normal text-base text-text-secondary dark:text-gray-400">支援</span></h2>
                        <div className="space-y-3">
                           <SettingsItem icon="help_outline" label="Help & Support" zh_label="幫助與支援" />
                           <SettingsItem icon="info" label="About Us" zh_label="關於我們" onClick={() => navigate('/about')} />
                           <SettingsItem icon="logout" label="Logout" zh_label="登出" onClick={handleLogout} isDestructive />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;