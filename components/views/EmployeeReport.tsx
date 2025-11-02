import React, { useState, useCallback } from 'react';
import { EmployeeReportRecord, EmployeeReportSummary } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Header from '../Header';
import Card from '../common/Card';
import Table from '../common/Table';
import { UsersIcon, ChartBarIcon } from '../common/icons';

// Get initial dates for the current month
const getInitialDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(1); // First day of the current month
    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
};

interface EmployeeReportProps {
    scriptUrl: string;
}

const EmployeeReport: React.FC<EmployeeReportProps> = ({ scriptUrl }) => {
    const { start, end } = getInitialDates();
    
    // State for inputs
    const [employeeId, setEmployeeId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(start);
    const [endDate, setEndDate] = useState<string>(end);

    // State for report data
    const [reportData, setReportData] = useState<EmployeeReportRecord[]>([]);
    const [summary, setSummary] = useState<EmployeeReportSummary | null>(null);

    // Hook for API call
    const { exec: fetchReport, loading: loadingReport } = useAppsScript<{ records: EmployeeReportRecord[], summary: EmployeeReportSummary }>(scriptUrl);
    
    // Function to generate the report
    const generateReport = useCallback(() => {
        if (!employeeId || !startDate || !endDate) {
            alert("Please enter an Employee ID.");
            return;
        }
        setReportData([]);
        setSummary(null);
        fetchReport({
            action: 'generateReport',
            reportType: 'employee',
            employeeId: employeeId,
            startDate,
            endDate
        }).then(response => {
            if (response && response.status === 'success') {
                if(response.data.records.length === 0) {
                     alert(`No records found for Employee ID: ${employeeId} in the selected date range.`);
                }
                setReportData(response.data.records);
                setSummary(response.data.summary);
            } else {
                setReportData([]);
                setSummary(null);
                alert(response?.message || 'Failed to fetch employee report.');
            }
        });
    }, [employeeId, startDate, endDate, fetchReport]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return <span className="text-gray-500">N/A</span>;
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        { header: 'Date', accessor: (row: EmployeeReportRecord) => row.date },
        { header: 'Check In', accessor: (row: EmployeeReportRecord) => formatTime(row.checkIn), cellClassName: 'text-center' },
        { header: 'Check Out', accessor: (row: EmployeeReportRecord) => formatTime(row.checkOut), cellClassName: 'text-center' },
        { header: 'Work Hours', accessor: (row: EmployeeReportRecord) => row.workHours.toFixed(2), cellClassName: 'text-center' },
        { header: 'Overtime', accessor: (row: EmployeeReportRecord) => row.overtimeHours.toFixed(2), cellClassName: 'text-center' },
        { header: 'Status', accessor: (row: EmployeeReportRecord) => {
            const statusText = row.isWorkDay ? 'Present' : (row.checkIn || row.checkOut ? 'Partial' : 'No Record');
            const statusClass = row.isWorkDay ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100' : 
                                  (row.checkIn || row.checkOut ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100' : 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-100');
            return (
                <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusClass}`}>
                    {statusText}
                </span>
            );
        }, cellClassName: 'text-center' },
    ];
    
    return (
        <>
            <Header title="Individual Employee Report" />
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <form onSubmit={(e) => { e.preventDefault(); generateReport(); }} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="employee-id-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
                        <input
                            type="text"
                            id="employee-id-input"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="Enter employee ID"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" disabled={loadingReport || !employeeId} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {loadingReport ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>
            
            {summary ? (
                <>
                    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                        <Card title="Employee" value={summary.employeeName} isLoading={loadingReport} icon={<UsersIcon />} />
                        <Card title="Total Work Days" value={summary.totalWorkDays} isLoading={loadingReport} icon={<ChartBarIcon />} />
                        <Card title="Total Work Hours" value={summary.totalWorkHours.toFixed(2)} isLoading={loadingReport} icon={<ChartBarIcon />} />
                        <Card title="Total Overtime Hours" value={summary.totalOvertimeHours.toFixed(2)} isLoading={loadingReport} icon={<ChartBarIcon />} />
                    </div>

                    <Table<EmployeeReportRecord>
                        columns={columns}
                        data={reportData}
                        isLoading={loadingReport}
                        noDataMessage="No attendance records found for this employee in the selected date range."
                    />
                </>
            ) : (
                <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    { !employeeId ? "Please enter an Employee ID to begin." : "Select a date range and click 'Generate Report' to view attendance data." }
                </div>
            )}
        </>
    );
};

export default EmployeeReport;