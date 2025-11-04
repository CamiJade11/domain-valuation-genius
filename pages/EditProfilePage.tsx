
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const handleBack = () => {
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            navigate('/settings');
        }
    };

    return (
        <div className="flex-1 flex flex-col font-nunito">
            <header className="sticky top-0 z-10 flex items-center justify-center text-center bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm relative h-[68px]">
                <button onClick={handleBack} className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 shrink-0 items-center justify-center text-text-primary dark:text-white">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                    <h1 className="font-display text-lg font-bold text-text-primary dark:text-white">Edit Personal Info</h1>
                    <p className="text-xs text-text-secondary dark:text-gray-400">編輯個人資訊</p>
                </div>
            </header>
            <main className="flex-1 px-4 pt-4 pb-10">
                <div className="flex w-full flex-col gap-8">
                    <div className="flex w-full flex-col items-center gap-4">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-2 border-white dark:border-background-dark shadow-md"
                                style={{ backgroundImage: `url("https://picsum.photos/128")` }}
                            ></div>
                            <button className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-white shadow-md">
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col">
                            <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Full Name <span className="font-normal text-sm text-text-secondary dark:text-gray-400">全名</span></p>
                            <input className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" defaultValue="Alexia Monroe" />
                        </label>
                        <label className="flex flex-col">
                             <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Email Address <span className="font-normal text-sm text-text-secondary dark:text-gray-400">電子郵件地址</span></p>
                            <input className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" defaultValue="alexia.monroe@email.com" />
                        </label>
                        <label className="flex flex-col">
                            <p className="pb-2 text-base font-semibold text-text-primary dark:text-gray-200">Password <span className="font-normal text-sm text-text-secondary dark:text-gray-400">密碼</span></p>
                            <div className="relative">
                                <input className="form-input h-14 w-full rounded-lg border border-border-light bg-card-light p-4 pr-12 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-border-dark dark:bg-card-dark dark:text-gray-100 dark:placeholder:text-gray-500" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary dark:text-gray-400">
                                    <span onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined cursor-pointer">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </div>
                            </div>
                            <p className="pt-1 text-sm text-text-secondary dark:text-gray-400">Leave blank to keep current password <br/>留空以保留目前密碼</p>
                        </label>
                    </div>
                    <button className="mt-4 flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-base font-bold tracking-[0.015em] shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]">
                        <div className="text-center">
                            <span className="truncate">Save Changes</span>
                            <br/><span className="text-xs font-normal">儲存變更</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EditProfilePage;