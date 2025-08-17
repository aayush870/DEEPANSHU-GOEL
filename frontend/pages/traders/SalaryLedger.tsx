import React, { useMemo } from 'react';
import { StaffMember, AttendanceStatus, AttendanceRecord, SalaryTransaction, SalaryTransactionType, SalaryChangeLog } from '../../types/index';
import { StaffList } from '../../components/traders/StaffList';
import { LedgerDetails } from '../../components/traders/LedgerDetails';

export const SalaryLedger: React.FC<{
    staff: StaffMember[];
    selectedStaffId: string | null;
    setSelectedStaffId: React.Dispatch<React.SetStateAction<string | null>>;
    attendanceRecords: AttendanceRecord[];
    salaryLedger: SalaryTransaction[];
    salaryChangeHistory: SalaryChangeLog[];
    selectedMonth: string;
    onOpenAddStaffModal: () => void;
    onOpenEditStaffModal: (staff: StaffMember) => void;
    onOpenMonthPicker: () => void;
    onOpenSalaryModal: (type: SalaryTransactionType) => void;
}> = ({
    staff,
    selectedStaffId,
    setSelectedStaffId,
    attendanceRecords,
    salaryLedger,
    salaryChangeHistory,
    selectedMonth,
    onOpenAddStaffModal,
    onOpenEditStaffModal,
    onOpenMonthPicker,
    onOpenSalaryModal
}) => {
    
    const selectedStaffMember = useMemo(() => staff.find(s => s.id === selectedStaffId), [staff, selectedStaffId]);
    
    const { selectedStaffTransactions, selectedStaffBalance } = useMemo(() => {
        if (!selectedStaffId) return { selectedStaffTransactions: [], selectedStaffBalance: 0 };
        
        const transactions = salaryLedger.filter(t => t.staffId === selectedStaffId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const balance = transactions.reduce((acc, t) => {
            return t.type === SalaryTransactionType.Advance ? acc + t.amount : acc - t.amount;
        }, 0);
        return { selectedStaffTransactions: transactions, selectedStaffBalance: balance };
    }, [salaryLedger, selectedStaffId]);
    
    const selectedStaffSalaryHistory = useMemo(() => {
        return salaryChangeHistory.filter(log => log.staffId === selectedStaffId).sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
    }, [salaryChangeHistory, selectedStaffId]);

    const salaryCalculation = useMemo(() => {
        if (!selectedStaffId || !selectedMonth) return null;
        
        const staffMember = staff.find(s => s.id === selectedStaffId);
        if (!staffMember || !staffMember.monthlySalary) {
            return { error: 'Monthly salary not set for this staff member.' };
        }

        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const perDaySalary = staffMember.monthlySalary / daysInMonth;

        const monthAttendance = attendanceRecords.filter(r =>
            r.staffId === selectedStaffId && r.date.startsWith(selectedMonth)
        );

        let presentDays = 0, absentDays = 0, halfDayDays = 0;

        monthAttendance.forEach(record => {
            switch (record.status) {
                case AttendanceStatus.Present: presentDays++; break;
                case AttendanceStatus.HalfDay: halfDayDays++; break;
                case AttendanceStatus.Absent: absentDays++; break;
            }
        });

        const recordedDaysCount = monthAttendance.length;
        const unrecordedDays = daysInMonth - recordedDaysCount;
        
        const totalPayableDays = presentDays + (halfDayDays * 0.5);
        const earnedSalary = totalPayableDays * perDaySalary;
        
        const netPayableSalary = earnedSalary - selectedStaffBalance;

        return {
            baseSalary: staffMember.monthlySalary, daysInMonth,
            presentDays: presentDays, halfDayDays,
            absentDays: absentDays + unrecordedDays,
            earnedSalary,
            advanceBalance: selectedStaffBalance,
            netPayableSalary
        };
    }, [selectedStaffId, selectedMonth, staff, attendanceRecords, selectedStaffBalance]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <StaffList
                staff={staff}
                selectedStaffId={selectedStaffId}
                setSelectedStaffId={setSelectedStaffId}
                onOpenAddStaffModal={onOpenAddStaffModal}
                onOpenEditStaffModal={onOpenEditStaffModal}
            />
            <LedgerDetails
                selectedStaffMember={selectedStaffMember}
                selectedMonth={selectedMonth}
                salaryCalculation={salaryCalculation}
                selectedStaffTransactions={selectedStaffTransactions}
                selectedStaffBalance={selectedStaffBalance}
                selectedStaffSalaryHistory={selectedStaffSalaryHistory}
                onOpenMonthPicker={onOpenMonthPicker}
                onOpenSalaryModal={onOpenSalaryModal}
            />
        </div>
    );
};