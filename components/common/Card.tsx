
import React from 'react';
import Spinner from './Spinner';

interface CardProps {
    title: string;
    value: string | number;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, isLoading = false, icon }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="flex items-center">
                {icon && <div className="p-3 mr-4 text-primary-500 bg-primary-100 rounded-full dark:text-primary-100 dark:bg-primary-500">{icon}</div>}
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    {isLoading ? (
                        <Spinner size="sm"/>
                    ) : (
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Card;
