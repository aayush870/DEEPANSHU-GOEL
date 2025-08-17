import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { SalaryTransactionType } from '../../../types';

export const SalaryTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (amount: number, notes: string) => void;
    transactionType: SalaryTransactionType;
}> = ({ isOpen, onClose, onAdd, transactionType }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const isAdvance = transactionType === SalaryTransactionType.Advance;

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            onAdd(numAmount, notes);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isAdvance ? 'Give Advance' : 'Record Settlement'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="salaryAmount" className="text-sm font-semibold text-slate-600 mb-1 block">Amount (₹)</label>
                    <input id="salaryAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required min="0.01" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900" />
                </div>
                <div>
                    <label htmlFor="salaryNotes" className="text-sm font-semibold text-slate-600 mb-1 block">Notes (Optional)</label>
                    <input id="salaryNotes" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder={isAdvance ? "e.g., Medical emergency" : "e.g., Deduction from salary"} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900" />
                </div>
                <div className="pt-2">
                    <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 ${isAdvance ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'}`}>
                        {isAdvance ? 'Give Advance' : 'Record Settlement'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};