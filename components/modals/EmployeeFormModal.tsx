
import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { useAppsScript } from '../../hooks/useAppsScript';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    scriptUrl: string;
    employee: Employee | null;
    onSuccess: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, scriptUrl, employee, onSuccess }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    const isEditMode = !!employee;

    const { exec: submitForm, loading } = useAppsScript<{ message: string }>(scriptUrl);

    useEffect(() => {
        if (employee) {
            setId(employee.id);
            setName(employee.name);
            setJobTitle(employee.jobTitle);
        } else {
            setId('');
            setName('');
            setJobTitle('');
        }
    }, [employee, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { id, name, jobTitle };
        const action = isEditMode ? 'updateEmployee' : 'addEmployee';
        
        const response = await submitForm({
            action,
            payload: JSON.stringify(payload)
        }, 'POST');

        if (response && response.status === 'success') {
            alert(response.data.message);
            onSuccess();
        } else {
            alert(response?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Employee' : 'Add Employee'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="employee-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
                    <input
                        type="text"
                        id="employee-id"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                        disabled={isEditMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor="employee-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        id="employee-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                    <input
                        type="text"
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="pt-4 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {loading ? <Spinner size="sm" /> : (isEditMode ? 'Save Changes' : 'Add Employee')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EmployeeFormModal;
