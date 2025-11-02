import React, { useState, useEffect, useCallback } from 'react';
import { DailyReportRecord, DailyReportSummary } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Header from '../Header';
import Card from '../common/Card';
import Table from '../common/Table';
import { UsersIcon, ChartBarIcon } from '../common/icons';

interface DashboardProps {
    scriptUrl: string;
}

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const Dashboard: React.FC<DashboardProps> = ({ scriptUrl }) => {
    const [date, setDate] = useState<string>(getTodayDateString());
    const [reportData, setReportData] = useState<DailyReportRecord[]>([]);
    const [summary, setSummary] = useState<DailyReportSummary | null>(null);
    
    const { exec: fetchReport, loading } = useAppsScript<{ records: DailyReportRecord[], summary: DailyReportSummary }>(scriptUrl);

    const generateReport = useCallback(() => {
        if (!date) return;
        fetchReport({
            action: 'generateReport',
            reportType: 'daily',
            date: date
        }).then(response => {
            if (response && response.status === 'success') {
                setReportData(response.data.records);
                setSummary(response.data.summary);
            } else {
                setReportData([]);
                setSummary(null);
                alert(response?.message || 'Failed to fetch daily report.');
            }
        });
    }, [date, fetchReport]);

    useEffect(() => {
        generateReport();
    }, [generateReport]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return <span className="text-gray-500">N/A</span>;
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        { header: 'Employee', accessor: (row: DailyReportRecord) => (
            <div>
                <p className="font-semibold">{row.employeeName}</p>
                <p className="text-xs text-gray-500">{row.jobTitle}</p>
            </div>
        )},
        { header: 'Check In', accessor: (row: DailyReportRecord) => formatTime(row.checkIn), cellClassName: 'text-center' },
        { header: 'Check Out', accessor: (row: DailyReportRecord) => formatTime(row.checkOut), cellClassName: 'text-center' },
        { header: 'Work Hours', accessor: (row: DailyReportRecord) => row.workHours.toFixed(2), cellClassName: 'text-center' },
        { header: 'Overtime', accessor: (row: DailyReportRecord) => row.overtimeHours.toFixed(2), cellClassName: 'text-center' },
        { header: 'Status', accessor: (row: DailyReportRecord) => (
            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                row.isWorkDay ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100' : 
                (row.checkIn || row.checkOut ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100' : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100')
            }`}>
                {row.isWorkDay ? 'Present' : (row.checkIn || row.checkOut ? 'Partial' : 'Absent')}
            </span>
        ), cellClassName: 'text-center' },
    ];

    return (
        <>
            <Header title="Daily Attendance Report" />
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                        <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Date
                        </label>
                        <input
                            type="date"
                            id="report-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 self-end"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Employees Present" value={summary?.totalEmployeesChecked ?? 0} isLoading={loading} icon={<UsersIcon />} />
                <Card title="Total Work Hours" value={summary?.totalWorkHours.toFixed(2) ?? 0} isLoading={loading} icon={<ChartBarIcon />} />
                <Card title="Total Overtime Hours" value={summary?.totalOvertimeHours.toFixed(2) ?? 0} isLoading={loading} icon={<ChartBarIcon />} />
            </div>

            <Table<DailyReportRecord>
                columns={columns}
                data={reportData}
                isLoading={loading}
                noDataMessage="No attendance records found for this date."
            />
        </>
    );
};

export default Dashboard;