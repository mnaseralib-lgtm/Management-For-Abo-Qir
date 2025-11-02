
import React from 'react';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    return (
        <div className="mb-6 md:flex md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
            <div className="mt-4 md:mt-0">
                {children}
            </div>
        </div>
    );
};

export default Header;
