import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/views/Dashboard';
import EmployeeManager from './components/views/EmployeeManager';
import EmployeeReport from './components/views/EmployeeReport';
import RangeReport from './components/views/RangeReport';
import { AppView, Employee } from './types';
import { useAppsScript } from './hooks/useAppsScript';
import Spinner from './components/common/Spinner';
import AttendanceAdjustment from './components/views/AttendanceAdjustment';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('dashboard');
    const [scriptUrl, setScriptUrl] = useState<string | null>(null);
    
    // Initialize tempUrl directly from localStorage to prevent stale closures in useEffect.
    const [tempUrl, setTempUrl] = useState<string>(() => localStorage.getItem('appsScriptUrl') || '');
    
    const [isUrlValid, setIsUrlValid] = useState<boolean>(false);
    
    // Set initial checking state only if a URL exists in localStorage.
    const [isCheckingUrl, setIsCheckingUrl] = useState<boolean>(!!localStorage.getItem('appsScriptUrl'));

    const { exec: checkUrl, loading: checking } = useAppsScript<Employee[]>(tempUrl);

    useEffect(() => {
        const storedUrl = localStorage.getItem('appsScriptUrl');
        if (storedUrl) {
            // The useAppsScript hook is initialized with the correct URL from the start,
            // so we can safely call the check function here.
            checkUrl({ action: 'getEmployees' })
                .then(response => {
                    if (response && response.status === 'success') {
                        setScriptUrl(storedUrl);
                        setIsUrlValid(true);
                    } else {
                        // The stored URL is invalid, remove it so the user sees the setup screen.
                        localStorage.removeItem('appsScriptUrl');
                    }
                })
                .finally(() => setIsCheckingUrl(false));
        }
        // No 'else' block needed, as isCheckingUrl is already false if no URL was stored.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await checkUrl({ action: 'getEmployees' });
        if (response && response.status === 'success') {
            localStorage.setItem('appsScriptUrl', tempUrl);
            setScriptUrl(tempUrl);
            setIsUrlValid(true);
        } else {
            alert('Invalid Google Apps Script URL. Please check and try again. Make sure the script is deployed correctly.');
            setIsUrlValid(false);
        }
    };
    
    const handleLogout = useCallback(() => {
        localStorage.removeItem('appsScriptUrl');
        setScriptUrl(null);
        setTempUrl('');
        setIsUrlValid(false);
    }, []);


    if (isCheckingUrl) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <Spinner />
            </div>
        );
    }
    
    if (!scriptUrl || !isUrlValid) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Setup Backend URL</h2>
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Please enter the deployed URL of your Google Apps Script to connect to the backend.
                    </p>
                    <form className="space-y-6" onSubmit={handleUrlSubmit}>
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Apps Script URL
                            </label>
                            <div className="mt-1">
                                <input
                                    id="url"
                                    name="url"
                                    type="url"
                                    required
                                    className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="https://script.google.com/macros/s/..."
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={checking}
                                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                            >
                                {checking ? <Spinner size="sm" /> : 'Connect & Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard scriptUrl={scriptUrl} />;
            case 'employees':
                return <EmployeeManager scriptUrl={scriptUrl} />;
            case 'attendance-adjustment':
                return <AttendanceAdjustment scriptUrl={scriptUrl} />;
            case 'employee-report':
                return <EmployeeReport scriptUrl={scriptUrl} />;
            case 'range-report':
                return <RangeReport scriptUrl={scriptUrl} />;
            default:
                return <Dashboard scriptUrl={scriptUrl} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar currentView={view} setView={setView} onLogout={handleLogout} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default App;