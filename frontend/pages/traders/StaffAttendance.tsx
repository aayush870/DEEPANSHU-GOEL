import React, { useState, useMemo, useEffect } from 'react';
import { StaffMember, AttendanceStatus, AttendanceRecord, SalaryTransaction, SalaryTransactionType, SalaryChangeLog } from '../../types/index';
import { 
    IconUserPlus, IconLockClosed, IconArrowLeft, IconPencil, IconCalendar, IconArrowUpCircle, 
    IconArrowDownCircle, IconCheck, IconTrash, IconEye, IconEyeOff
} from '../../assets/icons';
import { getTodayDateString } from '../../utils/helpers';
import { DatePicker } from './pickers/DatePicker';
import { MonthPicker } from './pickers/MonthPicker';
import { SalaryLedger } from './SalaryLedger';
import { AddEditStaffModal } from './components/AddEditStaffModal';
import { SalaryTransactionModal } from './components/SalaryTransactionModal';

export const StaffAttendance: React.FC<{
    staff: StaffMember[];
    setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
    attendanceRecords: AttendanceRecord[];
    setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    salaryLedger: SalaryTransaction[];
    setSalaryLedger: React.Dispatch<React.SetStateAction<SalaryTransaction[]>>;
    salaryChangeHistory: SalaryChangeLog[];
    setSalaryChangeHistory: React.Dispatch<React.SetStateAction<SalaryChangeLog[]>>;
    onDeleteStaff: (id: string, name: string) => boolean;
    onBack: () => void;
}> = ({ staff, setStaffMembers, attendanceRecords, setAttendanceRecords, salaryLedger, setSalaryLedger, salaryChangeHistory, setSalaryChangeHistory, onDeleteStaff, onBack }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const correctPassword = '9255227867';

    const [activeTab, setActiveTab] = useState<'attendance' | 'ledger'>('attendance');
    
    // Staff management state
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === correctPassword) {
            setIsAuthenticated(true);
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Please try again.');
            setPasswordInput('');
        }
    };
    
    // Attendance Tab State & Logic
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        // Only run automation for the current date
        if (selectedDate === getTodayDateString()) {
            const newRecords: AttendanceRecord[] = [];
            const staffWithRecords = new Set(
                attendanceRecords
                    .filter(r => r.date === selectedDate)
                    .map(r => r.staffId)
            );

            staff.forEach(member => {
                if (!staffWithRecords.has(member.id)) {
                    // Automatically mark staff as 'Present' if they have no record for today
                    newRecords.push({
                        staffId: member.id,
                        date: selectedDate,
                        status: AttendanceStatus.Present,
                    });
                }
            });

            if (newRecords.length > 0) {
                setAttendanceRecords(prev => [...prev, ...newRecords]);
            }
        }
    }, [selectedDate, staff, attendanceRecords, setAttendanceRecords]);

    const attendanceStatusMap = useMemo(() => {
        const map = new Map<string, AttendanceStatus>();
        attendanceRecords
            .filter(r => r.date === selectedDate)
            .forEach(r => map.set(r.staffId, r.status));
        return map;
    }, [attendanceRecords, selectedDate]);
    
    const handleSetAttendance = (staffId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => {
            const existingRecordIndex = prev.findIndex(r => r.date === selectedDate && r.staffId === staffId);
            if (existingRecordIndex > -1) {
                const updatedRecords = [...prev];
                updatedRecords[existingRecordIndex] = { ...updatedRecords[existingRecordIndex], status };
                return updatedRecords;
            } else {
                return [...prev, { staffId, date: selectedDate, status }];
            }
        });
    };
    
    // Salary Ledger Tab State & Logic
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(staff[0]?.id || null);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [salaryModalType, setSalaryModalType] = useState<SalaryTransactionType>(SalaryTransactionType.Advance);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // e.g. "2024-07"
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    
    // Update selected staff if the list changes
    useEffect(() => {
        if (!selectedStaffId || !staff.some(s => s.id === selectedStaffId)) {
            setSelectedStaffId(staff[0]?.id || null);
        }
    }, [staff, selectedStaffId]);

    const handleOpenAddStaffModal = () => {
        setEditingStaff(null);
        setIsStaffModalOpen(true);
    };

    const handleOpenEditStaffModal = (staff: StaffMember) => {
        setEditingStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleSaveStaff = (staffData: Omit<StaffMember, 'id'>, existingId?: string) => {
        if (existingId) { // Editing existing staff
            const originalStaff = staff.find(s => s.id === existingId);
            if (originalStaff && originalStaff.monthlySalary !== staffData.monthlySalary) {
                // Log salary change
                 const newLog: SalaryChangeLog = {
                    id: `scl-${Date.now()}`,
                    staffId: existingId,
                    previousSalary: originalStaff.monthlySalary,
                    newSalary: staffData.monthlySalary,
                    changeDate: new Date().toISOString(),
                    changedBy: 'Admin',
                };
                setSalaryChangeHistory(prev => [newLog, ...prev]);
            }

            setStaffMembers(prev => prev.map(s => s.id === existingId ? { ...s, ...staffData } : s));
        } else { // Adding new staff
            const newStaff: StaffMember = {
                id: `staff-${Date.now()}`,
                ...staffData
            };
            setStaffMembers(prev => [...prev, newStaff]);
        }
        setIsStaffModalOpen(false);
    };

    const handleAddSalaryTransaction = (amount: number, notes: string) => {
        if (!selectedStaffId) return;
        const newTransaction: SalaryTransaction = {
            id: `sal-txn-${Date.now()}`,
            staffId: selectedStaffId,
            type: salaryModalType,
            amount,
            notes,
            date: new Date().toISOString(),
        };
        setSalaryLedger(prev => [...prev, newTransaction]);
    };
    
    const openSalaryModal = (type: SalaryTransactionType) => {
        setSalaryModalType(type);
        setIsSalaryModalOpen(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl text-center">
                <IconLockClosed className="mx-auto w-12 h-12 text-slate-400" />
                <h2 className="text-xl font-bold text-slate-800 mt-4">Authorization Required</h2>
                <p className="text-slate-500 mt-2 mb-6">Please enter the password to access staff details.</p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            placeholder="Enter password"
                            className="w-full text-center px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
                            autoFocus
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                    </div>
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">
                        Unlock
                    </button>
                </form>
            </div>
        );
    }

    const attendanceStatusStyles: Record<AttendanceStatus, string> = {
        [AttendanceStatus.Present]: 'ring-green-500 bg-green-100 text-green-800',
        [AttendanceStatus.Absent]: 'ring-red-500 bg-red-100 text-red-800',
        [AttendanceStatus.HalfDay]: 'ring-sky-500 bg-sky-100 text-sky-800',
    };

    return (
        <div className="space-y-6">
             <SalaryTransactionModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} onAdd={handleAddSalaryTransaction} transactionType={salaryModalType} />
             <AddEditStaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={handleSaveStaff} staffMember={editingStaff} onDelete={onDeleteStaff} />

             <DatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    setIsDatePickerOpen(false);
                }}
            />
             <MonthPicker
                isOpen={isMonthPickerOpen}
                onClose={() => setIsMonthPickerOpen(false)}
                value={selectedMonth}
                onSelect={(newMonth) => {
                    setSelectedMonth(newMonth);
                    setIsMonthPickerOpen(false);
                }}
            />


            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" aria-label="Back to To-Do list">
                        <IconArrowLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
                </div>
                 <div className="bg-slate-200 p-1 rounded-lg flex items-center gap-1">
                     <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeTab === 'attendance' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Attendance</button>
                     <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeTab === 'ledger' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Salary Ledger</button>
                 </div>
            </div>

            {activeTab === 'attendance' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-700">Daily Attendance</h3>
                        
                        <button
                            onClick={() => setIsDatePickerOpen(true)}
                            className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors"
                            aria-label={`Change date, current date is ${formatDateForDisplay(selectedDate)}`}
                        >
                            <IconCalendar className="w-6 h-6 text-blue-500" />
                            <div className="text-left">
                                <p className="font-bold text-lg text-slate-800">{formatDateForDisplay(selectedDate)}</p>
                                <p className="text-sm text-slate-500 font-mono">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {staff.map(member => (
                            <div key={member.id} className="p-4 rounded-xl bg-slate-50 sm:flex sm:items-center sm:justify-between">
                                <div className="mb-3 sm:mb-0">
                                    <p className="font-bold text-slate-800">{member.name}</p>
                                    <p className="text-sm text-slate-500">{member.role}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(AttendanceStatus).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleSetAttendance(member.id, status)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${attendanceStatusMap.get(member.id) === status ? `ring-2 ${attendanceStatusStyles[status]}` : `bg-slate-200 text-slate-600 hover:bg-slate-300`}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'ledger' && (
               <SalaryLedger
                    staff={staff}
                    selectedStaffId={selectedStaffId}
                    setSelectedStaffId={setSelectedStaffId}
                    attendanceRecords={attendanceRecords}
                    salaryLedger={salaryLedger}
                    salaryChangeHistory={salaryChangeHistory}
                    selectedMonth={selectedMonth}
                    onOpenAddStaffModal={handleOpenAddStaffModal}
                    onOpenEditStaffModal={handleOpenEditStaffModal}
                    onOpenMonthPicker={() => setIsMonthPickerOpen(true)}
                    onOpenSalaryModal={openSalaryModal}
               />
            )}
        </div>
    );
};