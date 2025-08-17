import React from 'react';
import { StaffMember, SalaryTransaction, SalaryTransactionType, SalaryChangeLog } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { 
    IconCalendar, IconChevronDown, IconArrowUpCircle, IconArrowDownCircle, IconCheck, IconUsers 
} from '../../assets/icons';

interface SalaryCalculation {
    error?: string;
    baseSalary?: number;
    daysInMonth?: number;
    presentDays?: number;
    halfDayDays?: number;
    absentDays?: number;
    earnedSalary?: number;
    advanceBalance?: number;
    netPayableSalary?: number;
}

interface LedgerDetailsProps {
    selectedStaffMember: StaffMember | undefined;
    selectedMonth: string;
    salaryCalculation: SalaryCalculation | null;
    selectedStaffTransactions: SalaryTransaction[];
    selectedStaffBalance: number;
    selectedStaffSalaryHistory: SalaryChangeLog[];
    onOpenMonthPicker: () => void;
    onOpenSalaryModal: (type: SalaryTransactionType) => void;
}

export const LedgerDetails: React.FC<LedgerDetailsProps> = ({
    selectedStaffMember,
    selectedMonth,
    salaryCalculation,
    selectedStaffTransactions,
    selectedStaffBalance,
    selectedStaffSalaryHistory,
    onOpenMonthPicker,
    onOpenSalaryModal
}) => {
    if (!selectedStaffMember) {
        return (
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col items-center justify-center text-center text-slate-500">
                <IconUsers />
                <h3 className="mt-4 text-xl font-semibold">Select a staff member</h3>
                <p>Choose someone from the list to view their salary ledger.</p>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg h-full">
            <div className="flex flex-col h-full">
                <div className="pb-4 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">{selectedStaffMember.name}</h2>
                        <button
                            onClick={onOpenMonthPicker}
                            className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                        >
                            <IconCalendar className="text-blue-500 w-5 h-5" />
                            <span className="font-semibold text-slate-700">
                                {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <IconChevronDown className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    <p className={`font-semibold text-sm ${selectedStaffBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        Total Advance Outstanding: {formatCurrency(selectedStaffBalance)}
                    </p>
                </div>

                {salaryCalculation && (
                    <div className="my-6 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                        <h4 className="text-lg font-bold text-blue-800">Salary for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                        {salaryCalculation.error ? (
                            <p className="text-center text-red-500 py-4">{salaryCalculation.error}</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xs text-slate-500">Present</p><p className="font-bold text-lg text-slate-700">{salaryCalculation.presentDays}</p></div>
                                    <div><p className="text-xs text-slate-500">Half Day</p><p className="font-bold text-lg text-slate-700">{salaryCalculation.halfDayDays}</p></div>
                                    <div><p className="text-xs text-slate-500">Absent</p><p className="font-bold text-lg text-slate-700">{salaryCalculation.absentDays}</p></div>
                                </div>
                                <div className="pt-4 border-t border-blue-200 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-slate-600">Base Salary:</p>
                                        <p className="font-semibold text-slate-800">{formatCurrency(salaryCalculation.baseSalary!)}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm"><p className="text-slate-600">Earned This Month:</p><p className="font-semibold text-green-600">{formatCurrency(salaryCalculation.earnedSalary!)}</p></div>
                                    <div className="flex justify-between items-center text-sm"><p className="text-slate-600">Advance Deduction:</p><p className="font-semibold text-red-600">{formatCurrency(salaryCalculation.advanceBalance!)}</p></div>
                                    <div className="pt-2 mt-2 border-t border-blue-200 flex justify-between items-center">
                                        <p className="text-base font-bold text-blue-800">Net Payable Salary:</p>
                                        <p className="text-xl font-bold text-blue-800">{formatCurrency(salaryCalculation.netPayableSalary!)}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <button onClick={() => onOpenSalaryModal(SalaryTransactionType.Advance)} className="flex-1 bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"><IconArrowUpCircle /> Give Advance</button>
                    <button onClick={() => onOpenSalaryModal(SalaryTransactionType.Settlement)} className="flex-1 bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"><IconCheck /> Record Settlement</button>
                </div>

                <div className="flex-1 mt-6 flex flex-col min-h-0">
                    <div className="overflow-y-auto space-y-4 pr-2 -mr-2">
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2">Transaction History</h4>
                            <div className="space-y-3">
                                {selectedStaffTransactions.length > 0 ? selectedStaffTransactions.map(t => (
                                    <div key={t.id} className="p-4 rounded-xl bg-slate-50">
                                        <div className="flex items-start gap-4">
                                            {t.type === SalaryTransactionType.Advance ? <IconArrowUpCircle /> : <IconArrowDownCircle />}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p className={`font-semibold ${t.type === SalaryTransactionType.Advance ? 'text-red-700' : 'text-green-700'}`}>{t.type}</p>
                                                    <p className={`font-bold text-lg ${t.type === SalaryTransactionType.Advance ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(t.amount)}</p>
                                                </div>
                                                <div className="flex justify-between items-baseline text-sm">
                                                    <p className="text-slate-500 italic flex-1 break-words">{t.notes}</p>
                                                    <p className="text-slate-400 pl-2">{new Date(t.date).toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-slate-400 pt-4">No transaction history.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2">Salary Change History</h4>
                            <div className="space-y-3">
                                {selectedStaffSalaryHistory.length > 0 ? selectedStaffSalaryHistory.map(log => (
                                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-slate-700">Salary Updated</p>
                                            <p className="text-xs text-slate-500">{new Date(log.changeDate).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-4 text-center">
                                            <div>
                                                <p className="text-xs text-slate-500">From</p>
                                                <p className="font-bold text-red-600">{formatCurrency(log.previousSalary)}</p>
                                            </div>
                                            <p className="text-lg font-bold text-slate-400">→</p>
                                            <div>
                                                <p className="text-xs text-slate-500">To</p>
                                                <p className="font-bold text-green-600">{formatCurrency(log.newSalary)}</p>
                                            </div>
                                        </div>
                                        <p className="text-right text-xs text-slate-400 mt-1">Changed by: {log.changedBy}</p>
                                    </div>
                                )) : <p className="text-center text-slate-400 pt-4">No salary change history.</p>}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};