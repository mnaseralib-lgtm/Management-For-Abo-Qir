import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyReportRecord, Employee } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Header from '../Header';
import Table from '../common/Table';
import { SaveIcon } from '../common/icons';
import Spinner from '../common/Spinner';

interface AttendanceAdjustmentProps {
    scriptUrl: string;
}

// Helper to format ISO string to HH:mm for time input
const isoToTime = (isoString: string | null): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toTimeString().slice(0, 5);
    } catch (e) {
        return '';
    }
};

const AttendanceAdjustment: React.FC<AttendanceAdjustmentProps> = ({ scriptUrl }) => {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState<DailyReportRecord[]>([]);
    const [modifiedRecords, setModifiedRecords] = useState<Record<string, Partial<DailyReportRecord>>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [isSavingAll, setIsSavingAll] = useState(false);

    const { exec: fetchReport, loading: loadingReport } = useAppsScript<{ records: DailyReportRecord[], summary: any }>(scriptUrl);
    const { exec: fetchEmployees, loading: loadingEmployees } = useAppsScript<Employee[]>(scriptUrl);
    const { exec: submitAdjustment } = useAppsScript<{ message: string }>(scriptUrl);

    const loadData = useCallback(() => {
        setModifiedRecords({});
        setRecords([]);
        
        Promise.all([
            fetchEmployees({ action: 'getEmployees' }),
            fetchReport({ action: 'generateReport', reportType: 'daily', date: date })
        ]).then(([employeesResponse, reportResponse]) => {
            if (!employeesResponse || employeesResponse.status !== 'success') {
                alert(employeesResponse?.message || 'Failed to fetch employees list.');
                return;
            }
            if (!reportResponse || reportResponse.status !== 'success') {
                // Non-critical error, we can proceed with an empty report
                console.warn(reportResponse?.message || 'Failed to fetch attendance data, showing full employee list.');
            }
            
            const allEmployees = employeesResponse.data;
            const reportRecords = reportResponse?.data?.records || [];
            const reportMap = new Map(reportRecords.map(rec => [rec.employeeId, rec]));

            const unifiedData: DailyReportRecord[] = allEmployees.map(emp => {
                const reportEntry = reportMap.get(emp.id);
                if (reportEntry) {
                    return reportEntry;
                }
                return {
                    employeeId: emp.id,
                    employeeName: emp.name,
                    jobTitle: emp.jobTitle,
                    checkIn: null,
                    checkOut: null,
                    workHours: 0,
                    overtimeHours: 0,
                    isWorkDay: false,
                };
            });
            setRecords(unifiedData);
        });
    }, [date, fetchEmployees, fetchReport]);

    useEffect(() => {
        loadData();
    }, [date]); // Automatically reload when date changes

    const handleTimeChange = (employeeId: string, field: 'checkIn' | 'checkOut', value: string) => {
        setRecords(prev => prev.map(rec =>
            rec.employeeId === employeeId ? { ...rec, [field]: value ? `${date}T${value}:00` : null } : rec
        ));
        setModifiedRecords(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                employeeId,
                [field]: value ? `${date}T${value}:00` : null
            }
        }));
    };

    const handleSave = async (employeeId: string) => {
        const adjustment = modifiedRecords[employeeId];
        if (!adjustment) return;

        setSavingIds(prev => new Set(prev).add(employeeId));

        const currentRecord = records.find(r => r.employeeId === employeeId);
        const payload = {
            employeeId,
            date,
            checkIn: 'checkIn' in adjustment ? adjustment.checkIn : currentRecord?.checkIn,
            checkOut: 'checkOut' in adjustment ? adjustment.checkOut : currentRecord?.checkOut,
        };
        
        const response = await submitAdjustment({
            action: 'adjustAttendance',
            payload: JSON.stringify(payload)
        }, 'POST');

        if (response?.status === 'success') {
            setModifiedRecords(prev => {
                const newModified = { ...prev };
                delete newModified[employeeId];
                return newModified;
            });
        } else {
            alert(`Failed to save for ${payload.employeeId}: ${response?.message}`);
        }

        setSavingIds(prev => {
            const newSaving = new Set(prev);
            newSaving.delete(employeeId);
            return newSaving;
        });
    };

    const handleSaveAll = async () => {
        setIsSavingAll(true);
        const allPromises = Object.keys(modifiedRecords).map(empId => handleSave(empId));
        await Promise.all(allPromises);
        setIsSavingAll(false);
        alert('All changes have been processed.');
        loadData(); // Refresh data from the server
    };
    
    const filteredRecords = useMemo(() => {
        if (!searchTerm) return records;
        return records.filter(rec =>
            rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.employeeId.includes(searchTerm)
        );
    }, [records, searchTerm]);

    const columns = [
        { header: 'Employee', accessor: (row: DailyReportRecord) => (
            <div>
                <p className="font-semibold">{row.employeeName}</p>
                <p className="text-xs text-gray-500">{row.employeeId}</p>
            </div>
        )},
        { header: 'Check In', accessor: (row: DailyReportRecord) => (
            <input type="time" value={isoToTime(row.checkIn)} onChange={e => handleTimeChange(row.employeeId, 'checkIn', e.target.value)} className="w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
        )},
        { header: 'Check Out', accessor: (row: DailyReportRecord) => (
            <input type="time" value={isoToTime(row.checkOut)} onChange={e => handleTimeChange(row.employeeId, 'checkOut', e.target.value)} className="w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
        )},
        { header: 'Save', accessor: (row: DailyReportRecord) => {
            const isModified = !!modifiedRecords[row.employeeId];
            const isSaving = savingIds.has(row.employeeId);
            return (
                <button onClick={() => handleSave(row.employeeId)} disabled={!isModified || isSaving} className="flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isSaving ? <Spinner size="sm" /> : <SaveIcon />}
                    <span className="ml-2">{isSaving ? 'Saving' : 'Save'}</span>
                </button>
            )
        }}
    ];

    const isLoading = loadingEmployees || loadingReport;

    return (
        <>
            <Header title="Attendance Adjustment" />
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-wrap items-end gap-4">
                <div>
                    <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input type="date" id="report-date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div className="flex-grow">
                    <label htmlFor="search-employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Employee</label>
                    <input type="text" id="search-employee" placeholder="Name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSaveAll} disabled={Object.keys(modifiedRecords).length === 0 || isSavingAll} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                        {isSavingAll ? 'Saving...' : `Save All (${Object.keys(modifiedRecords).length})`}
                    </button>
                </div>
            </div>
            <Table<DailyReportRecord>
                columns={columns}
                data={filteredRecords}
                isLoading={isLoading}
                noDataMessage="No employees found in the database."
            />
        </>
    );
};

export default AttendanceAdjustment;