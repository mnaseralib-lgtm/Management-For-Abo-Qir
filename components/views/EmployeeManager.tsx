
import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Header from '../Header';
import Table from '../common/Table';
import { EditIcon, DeleteIcon } from '../common/icons';
import EmployeeFormModal from '../modals/EmployeeFormModal';

interface EmployeeManagerProps {
    scriptUrl: string;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ scriptUrl }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { exec: fetchEmployees, loading: loadingEmployees } = useAppsScript<Employee[]>(scriptUrl);
    const { exec: deleteEmployee, loading: deleting } = useAppsScript<{message: string}>(scriptUrl);
    const { exec: refreshCache, loading: refreshing } = useAppsScript<{message: string}>(scriptUrl);

    const loadEmployees = useCallback(() => {
        fetchEmployees({ action: 'getEmployees' }).then(response => {
            if (response && response.status === 'success') {
                setEmployees(response.data);
            } else {
                alert(response?.message || 'Failed to fetch employees.');
            }
        });
    }, [fetchEmployees]);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = async (employee: Employee) => {
        if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
            const response = await deleteEmployee({
                action: 'deleteEmployee',
                payload: JSON.stringify({ id: employee.id })
            }, 'POST');

            if (response && response.status === 'success') {
                alert(response.data.message);
                loadEmployees();
            } else {
                alert(response?.message || 'Failed to delete employee.');
            }
        }
    };
    
    const handleRefreshCache = async () => {
      const response = await refreshCache({action: 'refreshEmployeeCache'});
      if (response && response.status === 'success') {
        alert(response.data.message);
        loadEmployees();
      } else {
        alert(response?.message || "Failed to refresh cache.");
      }
    };

    const columns = [
        { header: 'Employee ID', accessor: (row: Employee) => row.id },
        { header: 'Name', accessor: (row: Employee) => row.name },
        { header: 'Job Title', accessor: (row: Employee) => row.jobTitle },
        {
            header: 'Actions',
            accessor: (row: Employee) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200" title="Edit">
                        <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(row)} disabled={deleting} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50" title="Delete">
                        <DeleteIcon />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Header title="Employee Management">
              <div className="flex items-center space-x-2">
                <button
                    onClick={handleRefreshCache}
                    disabled={refreshing}
                    className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Cache'}
                </button>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Add Employee
                </button>
              </div>
            </Header>
            <Table<Employee>
                columns={columns}
                data={employees}
                isLoading={loadingEmployees}
                noDataMessage="No employees found. Add one to get started."
            />
            <EmployeeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                scriptUrl={scriptUrl}
                employee={selectedEmployee}
                onSuccess={() => {
                    setIsModalOpen(false);
                    loadEmployees();
                }}
            />
        </>
    );
};

export default EmployeeManager;
