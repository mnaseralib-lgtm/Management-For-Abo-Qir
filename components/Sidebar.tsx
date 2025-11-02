
import React from 'react';
import { AppView } from '../types';
import { DashboardIcon, UsersIcon, ChartBarIcon, DocumentChartBarIcon, LogoutIcon, AdjustIcon } from './common/icons';

interface SidebarProps {
    currentView: AppView;
    setView: (view: AppView) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                isActive
                    ? 'text-white bg-primary-700'
                    : 'text-gray-300 hover:text-white hover:bg-primary-800'
            }`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
    return (
        <aside className="z-20 hidden w-64 overflow-y-auto bg-primary-900 md:block flex-shrink-0">
            <div className="py-4 text-gray-400">
                <a className="ml-6 text-lg font-bold text-white" href="#">
                    Smart Attendance
                </a>
                <ul className="mt-6">
                    <li className="relative">
                        <NavItem
                            icon={<DashboardIcon className="w-5 h-5" />}
                            label="Dashboard"
                            isActive={currentView === 'dashboard'}
                            onClick={() => setView('dashboard')}
                        />
                    </li>
                    <li className="relative">
                        <NavItem
                            icon={<UsersIcon className="w-5 h-5" />}
                            label="Employee Management"
                            isActive={currentView === 'employees'}
                            onClick={() => setView('employees')}
                        />
                    </li>
                    <li className="relative">
                        <NavItem
                            icon={<AdjustIcon className="w-5 h-5" />}
                            label="Attendance Adjustment"
                            isActive={currentView === 'attendance-adjustment'}
                            onClick={() => setView('attendance-adjustment')}
                        />
                    </li>
                    <li className="relative px-6 py-3">
                        <span className="text-xs uppercase text-gray-500">Reports</span>
                    </li>
                    <li className="relative">
                        <NavItem
                            icon={<ChartBarIcon className="w-5 h-5" />}
                            label="Employee Report"
                            isActive={currentView === 'employee-report'}
                            onClick={() => setView('employee-report')}
                        />
                    </li>
                    <li className="relative">
                        <NavItem
                            icon={<DocumentChartBarIcon className="w-5 h-5" />}
                            label="Range Report"
                            isActive={currentView === 'range-report'}
                            onClick={() => setView('range-report')}
                        />
                    </li>
                </ul>
                <div className="absolute bottom-0 w-full">
                    <NavItem
                        icon={<LogoutIcon className="w-5 h-5" />}
                        label="Disconnect"
                        isActive={false}
                        onClick={onLogout}
                    />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;