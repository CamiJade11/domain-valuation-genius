import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/results', icon: 'pie_chart', label: 'Valuations' },
    { path: '/portfolio', icon: 'folder', label: 'Portfolio' },
    { path: '/about', icon: 'info', label: 'About' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
];

const flowerIconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC5WrSBrotoK6npjxMzXyxtbyQlPkq6n4ydvS0Rrp_Tw8QQSDo2XsDWXPtsuVsnkhdedPyW7rVcwad9YgG0p8LFQQhzDXBxf1jHE0mpftsbEvONg33hjSOkp1dbnTNeAgl8vK4X5ZZnKK15HeQawQn8tw3s7ChSFkXTItk6kih9nTBnX-Jt7ECVq7EPwn9V_7Lc0fqjK7kThlppJ5GXnxGBYbz1pD406jyHOozMFKC47nyx04xELJk6MHjpbjCPdhI1mNMzLwBRBwc";


const SideNav: React.FC = () => {
    return (
        <nav className="hidden lg:flex lg:w-60 lg:flex-shrink-0 lg:flex-col lg:border-r lg:border-border-light lg:dark:border-border-dark">
            <div className="flex h-full flex-col p-4">
                <div className="flex items-center gap-2 p-3 mb-4">
                     <img src={flowerIconUrl} alt="Logo" className="h-8 w-8" />
                     <h1 className="font-display text-lg font-bold text-text-primary dark:text-white">Domain Genius</h1>
                </div>
                <div className="flex flex-col gap-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-primary/5 hover:text-text-primary dark:hover:bg-white/5 dark:text-gray-400 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default SideNav;