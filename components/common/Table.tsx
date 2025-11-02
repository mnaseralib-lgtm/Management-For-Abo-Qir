
import React from 'react';
import Spinner from './Spinner';

interface TableColumn<T> {
    header: string;
    accessor: (row: T) => React.ReactNode;
    cellClassName?: string;
}

interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    noDataMessage?: string;
}

const Table = <T,>({ columns, data, isLoading = false, noDataMessage = "No data available." }: TableProps<T>) => {
    return (
        <div className="w-full overflow-hidden rounded-lg shadow-md">
            <div className="w-full overflow-x-auto">
                <table className="w-full whitespace-no-wrap">
                    <thead>
                        <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                            {columns.map((col, index) => (
                                <th key={index} className="px-4 py-3">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-900">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-8 text-center">
                                    <div className="flex justify-center">
                                       <Spinner />
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    {noDataMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`px-4 py-3 text-sm ${col.cellClassName || ''}`}>
                                            {col.accessor(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
