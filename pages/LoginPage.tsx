
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a mock login. In a real app, you'd validate credentials.
        login();
        navigate('/settings');
    };

    return (
        <div className="flex-1 flex flex-col">
             <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center text-text-primary dark:text-white">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                    <h1 className="font-display text-lg font-bold text-text-primary dark:text-white">Welcome Back</h1>
                    <p className="text-xs text-text-secondary dark:text-gray-400">歡迎回來</p>
                </div>
            </header>
            <main className="flex-1 px-4 pt-8 pb-10">
                 <form onSubmit={handleLogin} className="flex w-full flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col">
                            <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Email Address <span className="font-normal text-sm text-text-secondary dark:text-gray-400">電子郵件地址</span></p>
                            <input 
                                type="email"
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" 
                                placeholder="you@example.com"
                                defaultValue="alexia.monroe@email.com"
                             />
                        </label>
                        <label className="flex flex-col">
                            <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Password <span className="font-normal text-sm text-text-secondary dark:text-gray-400">密碼</span></p>
                            <input 
                                type="password"
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" 
                                placeholder="••••••••"
                                defaultValue="password"
                            />
                        </label>
                    </div>
                    <button type="submit" className="mt-4 flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-base font-bold tracking-[0.015em] shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]">
                        <div className="text-center">
                            <span className="truncate">Login</span>
                            <br/><span className="text-xs font-normal">登入</span>
                        </div>
                    </button>
                    <p className="text-center text-sm text-text-secondary dark:text-gray-400">
                        Don't have an account? <a href="#" className="font-semibold text-primary hover:underline">Sign up</a>.
                    </p>
                </form>
            </main>
        </div>
    )
};

export default LoginPage;
