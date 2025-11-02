import React, { useState, useCallback } from 'react';
import { useAppsScript } from '../../hooks/useAppsScript';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface AdjustAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    scriptUrl: string;
    employeeId: string;
    employeeName: string;
    date: string;
    onSuccess: () => void;
}

const AdjustAttendanceModal: React.FC<AdjustAttendanceModalProps> = ({
    isOpen,
    onClose,
    scriptUrl,
    employeeId,
    employeeName,
    date,
    onSuccess
}) => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const { exec: submitAdjustment, loading } = useAppsScript<{ message: string }>(scriptUrl);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: at least one time must be entered
        if (!checkIn && !checkOut) {
            alert("Please enter a check-in time, a check-out time, or both.");
            return;
        }

        const payload = {
            employeeId,
            date,
            checkIn: checkIn ? `${date}T${checkIn}` : null,
            checkOut: checkOut ? `${date}T${checkOut}` : null
        };
        
        const response = await submitAdjustment({
            action: 'adjustAttendance',
            payload: JSON.stringify(payload)
        }, 'POST');

        if (response && response.status === 'success') {
            alert(response.data.message);
            setCheckIn('');
            setCheckOut('');
            onSuccess();
        } else {
            alert(response?.message || `Failed to adjust attendance.`);
        }
    }, [employeeId, date, checkIn, checkOut, submitAdjustment, onSuccess]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Attendance for ${employeeName}`}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adjusting for date: <strong>{date}</strong>. Leave a field blank to clear that record for the day.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="checkin-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-in Time</label>
                    <input
                        type="time"
                        id="checkin-time"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor="checkout-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-out Time</label>
                    <input
                        type="time"
                        id="checkout-time"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="pt-4 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {loading ? <Spinner size="sm" /> : 'Apply Adjustment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdjustAttendanceModal;