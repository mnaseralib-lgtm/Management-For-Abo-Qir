
import React, { useState, useCallback, useEffect } from 'react';
import { RangeReportRecord, RangeReportSummary } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Header from '../Header';
import Card from '../common/Card';
import Table from '../common/Table';
import { UsersIcon, ChartBarIcon } from '../common/icons';

interface RangeReportProps {
    scriptUrl: string;
}

const getInitialDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(1); // First day of the current month
    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
};

const RangeReport: React.FC<RangeReportProps> = ({ scriptUrl }) => {
    const { start, end } = getInitialDates();
    const [startDate, setStartDate] = useState<string>(start);
    const [endDate, setEndDate] = useState<string>(end);
    const [reportData, setReportData] = useState<RangeReportRecord[]>([]);
    const [summary, setSummary] = useState<RangeReportSummary | null>(null);

    const { exec: fetchReport, loading: loadingReport } = useAppsScript<{ records: RangeReportRecord[], summary: RangeReportSummary }>(scriptUrl);
    
    const generateReport = useCallback(() => {
        if (!startDate || !endDate) return;
        fetchReport({
            action: 'generateReport',
            reportType: 'range',
            startDate,
            endDate
        }).then(response => {
            if (response && response.status === 'success') {
                setReportData(response.data.records);
                setSummary(response.data.summary);
            } else {
                setReportData([]);
                setSummary(null);
                alert(response?.message || 'Failed to fetch range report.');
            }
        });
    }, [startDate, endDate, fetchReport]);

    useEffect(() => {
      generateReport();
    }, [generateReport]);

    const columns = [
        { header: 'Employee', accessor: (row: RangeReportRecord) => (
            <div>
                <p className="font-semibold">{row.employeeName}</p>
                <p className="text-xs text-gray-500">{row.jobTitle}</p>
            </div>
        )},
        { header: 'Total Work Days', accessor: (row: RangeReportRecord) => row.totalWorkDays, cellClassName: 'text-center' },
        { header: 'Total Work Hours', accessor: (row: RangeReportRecord) => row.totalWorkHours.toFixed(2), cellClassName: 'text-center' },
        { header: 'Total Overtime', accessor: (row: RangeReportRecord) => row.totalOvertimeHours.toFixed(2), cellClassName: 'text-center' }
    ];

    const totalWorkHours = reportData.reduce((sum, r) => sum + r.totalWorkHours, 0);
    const totalOvertimeHours = reportData.reduce((sum, r) => sum + r.totalOvertimeHours, 0);

    return (
        <>
            <Header title="Consolidated Range Report" />
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <form onSubmit={(e) => { e.preventDefault(); generateReport(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" disabled={loadingReport} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {loadingReport ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>
            
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Total Employees" value={summary?.totalEmployeesInReport ?? 0} isLoading={loadingReport} icon={<UsersIcon />} />
                <Card title="Total Work Hours (All)" value={totalWorkHours.toFixed(2)} isLoading={loadingReport} icon={<ChartBarIcon />} />
                <Card title="Total Overtime Hours (All)" value={totalOvertimeHours.toFixed(2)} isLoading={loadingReport} icon={<ChartBarIcon />} />
            </div>

            <Table<RangeReportRecord>
                columns={columns}
                data={reportData}
                isLoading={loadingReport}
                noDataMessage="No consolidated data found for the selected date range."
            />
        </>
    );
};

export default RangeReport;
