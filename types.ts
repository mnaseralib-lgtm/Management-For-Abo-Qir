
export type AppView = 'dashboard' | 'employees' | 'employee-report' | 'range-report' | 'attendance-adjustment';

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
}

export interface DailyReportRecord {
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number;
    overtimeHours: number;
    isWorkDay: boolean;
}

export interface DailyReportSummary {
    totalEmployeesChecked: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
    reportDate: string;
}

export interface EmployeeReportRecord {
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number;
    overtimeHours: number;
    isWorkDay: boolean;
}

export interface EmployeeReportSummary {
    employeeId: string;
    employeeName: string;
    totalDaysInReport: number;
    totalWorkDays: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
}

export interface RangeReportRecord {
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    totalWorkDays: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
}

export interface RangeReportSummary {
    totalEmployeesInReport: number;
    startDate: string;
    endDate: string;
}


export interface AppsScriptResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}