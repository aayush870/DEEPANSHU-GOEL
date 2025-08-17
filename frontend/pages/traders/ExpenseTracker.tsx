import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseItem, ExpenseCategory } from '../../types/index';
import { 
    IconPlus, IconReceipt, IconArrowLeft, IconPencil, IconChevronDown, IconTrash
} from '../../assets/icons';
import { formatCurrency, getTodayDateString } from '../../utils/helpers';
import { Modal } from '../../components/common/Modal';
import { MonthPicker } from './pickers/MonthPicker';

const AddExpenseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Omit<ExpenseItem, 'id'>, existingId?: string) => void;
    expense: ExpenseItem | null;
    initialCategory: ExpenseCategory;
}> = ({ isOpen, onClose, onSave, expense, initialCategory }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(getTodayDateString());
    const [category, setCategory] = useState<ExpenseCategory>(initialCategory);
    const [notes, setNotes] = useState('');
    
    const isEditing = expense !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && expense) {
                setDescription(expense.description);
                setAmount(String(expense.amount));
                setDate(expense.date.split('T')[0]);
                setCategory(expense.category);
                setNotes(expense.notes || '');
            } else {
                setDescription('');
                setAmount('');
                setDate(getTodayDateString());
                setCategory(initialCategory);
                setNotes('');
            }
        }
    }, [isOpen, expense, isEditing, initialCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (description.trim() && !isNaN(numAmount) && numAmount > 0) {
            onSave(
                { description: description.trim(), amount: numAmount, date, category, notes: notes.trim() },
                isEditing ? expense.id : undefined
            );
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Expense' : 'Add New Expense'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="expenseDesc" className="text-sm font-semibold text-slate-600 mb-1 block">Description</label>
                    <input id="expenseDesc" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Office Supplies" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expenseAmount" className="text-sm font-semibold text-slate-600 mb-1 block">Amount (₹)</label>
                        <input id="expenseAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required min="0.01" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                    </div>
                    <div>
                         <label htmlFor="expenseDate" className="text-sm font-semibold text-slate-600 mb-1 block">Date</label>
                        <input id="expenseDate" type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">Category</label>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <button type="button" onClick={() => setCategory(ExpenseCategory.Office)} className={`flex-1 text-center py-1.5 rounded-md font-semibold text-sm transition-all ${category === ExpenseCategory.Office ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Office</button>
                        <button type="button" onClick={() => setCategory(ExpenseCategory.Home)} className={`flex-1 text-center py-1.5 rounded-md font-semibold text-sm transition-all ${category === ExpenseCategory.Home ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Home</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="expenseNotes" className="text-sm font-semibold text-slate-600 mb-1 block">Notes (Optional)</label>
                    <textarea id="expenseNotes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any extra details..." rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">
                        {isEditing ? 'Save Changes' : 'Add Expense'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ExpenseCard: React.FC<{
    expense: ExpenseItem;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ expense, onEdit, onDelete }) => {
    return (
        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                 <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${expense.category === ExpenseCategory.Office ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <IconReceipt className={expense.category === ExpenseCategory.Office ? 'text-blue-500' : 'text-green-500'} />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-800">{expense.description}</p>
                    <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                    {expense.notes && <p className="text-xs italic text-slate-400 mt-1">{expense.notes}</p>}
                </div>
            </div>
            <div className="text-right flex items-center gap-4">
                <p className="font-bold text-lg text-red-600">{formatCurrency(expense.amount)}</p>
                 <div className="flex items-center gap-1">
                    <button onClick={onEdit} className="p-2 text-slate-500 hover:bg-slate-200 hover:text-blue-600 rounded-full transition-colors" aria-label="Edit expense"><IconPencil className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:bg-slate-200 hover:text-red-600 rounded-full transition-colors" aria-label="Delete expense"><IconTrash /></button>
                </div>
            </div>
        </div>
    );
};

export const ExpenseTracker: React.FC<{
    expenses: ExpenseItem[];
    setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
    onBack?: () => void;
}> = ({ expenses, setExpenses, onBack }) => {
    const [activeCategory, setActiveCategory] = useState<ExpenseCategory>(ExpenseCategory.Office);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // e.g. "2024-07"
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

    const handleOpenModal = (expense: ExpenseItem | null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleSaveExpense = (expenseData: Omit<ExpenseItem, 'id'>, existingId?: string) => {
        if (existingId) {
            setExpenses(prev => prev.map(e => e.id === existingId ? { ...expenseData, id: existingId } : e));
        } else {
            const newExpense: ExpenseItem = { id: `exp-${Date.now()}`, ...expenseData };
            setExpenses(prev => [newExpense, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteExpense = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    };
    
    const { monthlyTotal, filteredExpenses } = useMemo(() => {
        const filtered = expenses
            .filter(e => e.category === activeCategory && e.date.startsWith(selectedMonth))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
        const total = filtered.reduce((sum, e) => sum + e.amount, 0);

        return { monthlyTotal: total, filteredExpenses: filtered };
    }, [expenses, activeCategory, selectedMonth]);

    const catBtnActive = 'bg-white shadow text-blue-600';
    const catBtnInactive = 'text-slate-600';

    return (
        <div className="space-y-6">
            <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveExpense} expense={editingExpense} initialCategory={activeCategory} />
            <MonthPicker isOpen={isMonthPickerOpen} onClose={() => setIsMonthPickerOpen(false)} value={selectedMonth} onSelect={(month) => { setSelectedMonth(month); setIsMonthPickerOpen(false); }} />

             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" aria-label="Back">
                            <IconArrowLeft />
                        </button>
                    )}
                    <h2 className="text-2xl font-bold text-slate-800">Expense Tracker</h2>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="bg-slate-200 p-1 rounded-lg flex items-center gap-1">
                        <button onClick={() => setActiveCategory(ExpenseCategory.Office)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeCategory === ExpenseCategory.Office ? catBtnActive : catBtnInactive}`}>Office</button>
                        <button onClick={() => setActiveCategory(ExpenseCategory.Home)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeCategory === ExpenseCategory.Home ? catBtnActive : catBtnInactive}`}>Home</button>
                    </div>
                    <button 
                        onClick={() => handleOpenModal(null)}
                        className="flex-shrink-0 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                        <IconPlus /> Add Expense
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <button
                        onClick={() => setIsMonthPickerOpen(true)}
                        className="flex items-center gap-2 text-xl font-bold text-slate-700 hover:text-blue-600 transition-colors"
                        aria-label="Change month"
                    >
                        <span>{new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <IconChevronDown className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{activeCategory} Expenses Total</p>
                        <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyTotal)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map(expense => (
                            <ExpenseCard key={expense.id} expense={expense} onEdit={() => handleOpenModal(expense)} onDelete={() => handleDeleteExpense(expense.id)} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <p className="text-lg">No expenses recorded for this month.</p>
                            <p className="text-sm">Click 'Add Expense' to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};