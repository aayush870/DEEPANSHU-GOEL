import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { KhataTransaction, KhataCustomer, TransactionType, SupplierTransaction, Supplier } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

export const KhataReportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customerTransactions: KhataTransaction[];
    customers: KhataCustomer[];
    supplierTransactions: SupplierTransaction[];
    suppliers: Supplier[];
}> = ({ isOpen, onClose, customerTransactions, customers, supplierTransactions, suppliers }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const [customerFiltered, supplierFiltered] = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const filterFn = (t: KhataTransaction | SupplierTransaction) => {
            const tDate = new Date(t.date);
            if (period === 'daily') return tDate >= today;
            if (period === 'weekly') {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return tDate >= weekStart;
            }
            if (period === 'monthly') {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return tDate >= monthStart;
            }
            return false;
        };
        return [customerTransactions.filter(filterFn), supplierTransactions.filter(filterFn)];
    }, [customerTransactions, supplierTransactions, period]);

    const reportData = useMemo(() => {
        const customerCredit = customerFiltered.reduce((acc, t) => t.type === TransactionType.Credit ? acc + t.amount : acc, 0);
        const customerDebit = customerFiltered.reduce((acc, t) => t.type === TransactionType.Debit ? acc + t.amount : acc, 0);
        const supplierCredit = supplierFiltered.reduce((acc, t) => t.type === TransactionType.Credit ? acc + t.amount : acc, 0);
        const supplierDebit = supplierFiltered.reduce((acc, t) => t.type === TransactionType.Debit ? acc + t.amount : acc, 0);
        return { customerCredit, customerDebit, supplierCredit, supplierDebit };
    }, [customerFiltered, supplierFiltered]);

    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';
    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Unknown';
    
    const allTransactions = [
        ...customerFiltered.map(t => ({...t, partyType: 'Customer' as const, partyName: getCustomerName(t.customerId)})),
        ...supplierFiltered.map(t => ({...t, partyType: 'Supplier' as const, partyName: getSupplierName(t.supplierId)}))
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction Report">
            <div className="space-y-4">
                <div className="flex justify-center bg-slate-100 p-1 rounded-lg">
                    {(['daily', 'weekly', 'monthly'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`capitalize w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${period === p ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                            {p}
                        </button>
                    ))}
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                    <h4 className="font-bold text-slate-700 text-center">Customers</h4>
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-slate-500">Credit Given (Udhaar)</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(reportData.customerCredit)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Payment Received (Jama)</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.customerDebit)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                    <h4 className="font-bold text-slate-700 text-center">Suppliers</h4>
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-slate-500">Purchases Made</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(reportData.supplierCredit)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Payments Sent</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.supplierDebit)}</p>
                        </div>
                    </div>
                </div>


                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {allTransactions.length > 0 ? allTransactions.map(t => (
                        <div key={t.id} className={`p-3 rounded-lg flex justify-between items-center ${t.type === TransactionType.Credit ? 'bg-red-50' : 'bg-emerald-50'}`}>
                           <div>
                                <p className="font-semibold text-slate-800">{t.partyName}</p>
                                <p className="text-xs text-slate-500">{t.partyType} - {new Date(t.date).toLocaleDateString()}</p>
                           </div>
                            <p className={`font-bold ${t.type === TransactionType.Credit ? 'text-red-600' : 'text-green-600'}`}>
                                {t.type === TransactionType.Credit ? '+' : '-'} {formatCurrency(t.amount)}
                            </p>
                        </div>
                    )) : (
                        <p className="text-center text-slate-500 py-8">No transactions for this period.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};