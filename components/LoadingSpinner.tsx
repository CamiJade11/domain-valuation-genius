import React from 'react';

interface LoadingSpinnerProps {
    message: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    const flowerIconUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC5WrSBrotoK6npjxMzXyxtbyQlPkq6n4ydvS0Rrp_Tw8QQSDo2XsDWXPtsuVsnkhdedPyW7rVcwad9YgG0p8LFQQhzDXBxf1jHE0mpftsbEvONg33hjSOkp1dbnTNeAgl8vK4X5ZZnKK15HeQawQn8tw3s7ChSFkXTItk6kih9nTBnX-Jt7ECVq7EPwn9V_7Lc0fqjK7kThlppJ5GXnxGBYbz1pD406jyHOozMFKC47nyx04xELJk6MHjpbjCPdhI1mNMzLwBRBwc";

    return (
        <div className="flex flex-col items-center justify-center text-center pt-10">
            <img
                src={flowerIconUrl}
                alt="Loading..."
                className="h-16 w-16 animate-pulse-subtle"
            />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal pt-4">{message}</p>
        </div>
    );
};

export default LoadingSpinner;