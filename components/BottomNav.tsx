

import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { path: '/', icon: 'home', label: 'Home', zh_label: '首頁' },
    { path: '/results', icon: 'pie_chart', label: 'Valuations', zh_label: '估價' },
    { path: '/portfolio', icon: 'folder', label: 'Portfolio', zh_label: '投資組合' },
    { path: '/about', icon: 'info', label: 'About', zh_label: '關於' },
];

const BottomNav: React.FC = () => {
    return (
        <nav className="sticky bottom-0 z-20 flex gap-2 border-t border-border-light/50 bg-white/80 dark:border-border-dark/50 dark:bg-background-dark/80 backdrop-blur-sm px-4 pb-3 pt-2 h-[72px] lg:hidden">
            {navItems.map(item => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                            isActive ? 'text-primary' : 'text-text-secondary dark:text-gray-400'
                        }`
                    }
                >
                    <span className={`material-symbols-outlined flex items-center justify-center text-2xl`}>
                        {item.icon}
                    </span>
                    <div className="text-center">
                        <p className="text-xs font-medium leading-tight tracking-[0.015em]">
                            {item.label}
                        </p>
                        <p className="text-[10px] font-normal leading-tight tracking-normal">
                            {item.zh_label}
                        </p>
                    </div>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;