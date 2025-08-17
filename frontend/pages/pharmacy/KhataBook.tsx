import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { KhataCustomer, KhataTransaction, TransactionType, Supplier, SupplierTransaction } from '../../types/index';
import { initialKhataCustomers, initialKhataTransactions, initialSuppliers, initialSupplierTransactions } from '../../assets/data';
import { 
    IconBookOpen, IconSearch, IconPlus, IconCheck, IconPhone, IconWhatsApp, IconUserPlus, IconFileText, IconArrowUpCircle, IconArrowDownCircle, IconPaperclip, IconX 
} from '../../assets/icons';
import { formatCurrency, fileToBase64 } from '../../utils/helpers';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { AddCustomerModal } from './components/AddCustomerModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { KhataReportModal } from './components/KhataReportModal';

export const KhataBook = () => {
    // State
    const [activeView, setActiveView] = useState<'customers' | 'suppliers'>('customers');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    // Data State
    const [customers, setCustomers] = useLocalStorageState<KhataCustomer[]>('khata_customers', initialKhataCustomers);
    const [customerTransactions, setCustomerTransactions] = useLocalStorageState<KhataTransaction[]>('khata_transactions', initialKhataTransactions);
    const [suppliers, setSuppliers] = useLocalStorageState<Supplier[]>('khata_suppliers', initialSuppliers);
    const [supplierTransactions, setSupplierTransactions] = useLocalStorageState<SupplierTransaction[]>('khata_supplier_transactions', initialSupplierTransactions);

    // Modal State
    const [isAddPartyModalOpen, setAddPartyModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setAddTransactionModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [transactionModalType, setTransactionModalType] = useState<TransactionType>(TransactionType.Credit);

    // Memos for calculating balances
    const customerBalances = useMemo(() => {
        const balances = new Map<string, number>();
        customers.forEach(c => balances.set(c.id, 0));
        customerTransactions.forEach(t => {
            const currentBalance = balances.get(t.customerId) || 0;
            balances.set(t.customerId, currentBalance + (t.type === TransactionType.Credit ? t.amount : -t.amount));
        });
        return balances;
    }, [customers, customerTransactions]);

    const supplierBalances = useMemo(() => {
        const balances = new Map<string, number>();
        suppliers.forEach(s => balances.set(s.id, 0));
        supplierTransactions.forEach(t => {
            const currentBalance = balances.get(t.supplierId) || 0;
            balances.set(t.supplierId, currentBalance + (t.type === TransactionType.Credit ? t.amount : -t.amount));
        });
        return balances;
    }, [suppliers, supplierTransactions]);
    
    // Memos for filtering and selecting data
    const filteredCustomers = useMemo(() => customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.contact.includes(searchQuery)), [customers, searchQuery]);
    const filteredSuppliers = useMemo(() => suppliers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.contact.includes(searchQuery)), [suppliers, searchQuery]);

    useEffect(() => {
        const list = activeView === 'customers' ? filteredCustomers : filteredSuppliers;
        if (!selectedId || !list.some(item => item.id === selectedId)) {
            setSelectedId(list[0]?.id || null);
        }
    }, [activeView, filteredCustomers, filteredSuppliers, selectedId]);
    
    const { selectedEntity, selectedTransactions, selectedBalance } = useMemo(() => {
        if (!selectedId) return { selectedEntity: null, selectedTransactions: [], selectedBalance: 0 };
        if (activeView === 'customers') {
            return {
                selectedEntity: customers.find(c => c.id === selectedId),
                selectedTransactions: customerTransactions.filter(t => t.customerId === selectedId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                selectedBalance: customerBalances.get(selectedId) || 0
            };
        } else {
            return {
                selectedEntity: suppliers.find(s => s.id === selectedId),
                selectedTransactions: supplierTransactions.filter(t => t.supplierId === selectedId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                selectedBalance: supplierBalances.get(selectedId) || 0
            };
        }
    }, [selectedId, activeView, customers, customerTransactions, customerBalances, suppliers, supplierTransactions, supplierBalances]);
    
    // Handlers
    const handleAddParty = (name: string, contact: string) => {
        if (activeView === 'customers') {
            const newCustomer: KhataCustomer = { id: `khata-${Date.now()}`, name, contact };
            setCustomers(prev => [...prev, newCustomer]);
            setSelectedId(newCustomer.id);
        } else {
            const newSupplier: Supplier = { id: `sup-${Date.now()}`, name, contact };
            setSuppliers(prev => [...prev, newSupplier]);
            setSelectedId(newSupplier.id);
        }
    };

    const handleAddTransaction = async (amount: number, notes: string, photoFiles: File[]) => {
        if (!selectedId) return;
        const photoBase64s = await Promise.all(photoFiles.map(fileToBase64));
        if (activeView === 'customers') {
            const newTransaction: KhataTransaction = { id: `txn-${Date.now()}`, customerId: selectedId, type: transactionModalType, amount, notes, date: new Date().toISOString(), photos: photoBase64s };
            setCustomerTransactions(prev => [...prev, newTransaction]);
        } else {
            const newTransaction: SupplierTransaction = { id: `stxn-${Date.now()}`, supplierId: selectedId, type: transactionModalType, amount, notes, date: new Date().toISOString(), photos: photoBase64s };
            setSupplierTransactions(prev => [...prev, newTransaction]);
        }
    };
    
    const openTransactionModal = (type: TransactionType) => {
        setTransactionModalType(type);
        setAddTransactionModalOpen(true);
    };

    const handleSendReminder = () => {
        if (!selectedEntity || selectedBalance <= 0 || activeView !== 'customers') return;
        const message = encodeURIComponent(`Hello ${selectedEntity.name}, this is a friendly reminder from Shri Kripa Pharmacy. Your outstanding balance is ${formatCurrency(selectedBalance)}. Thank you!`);
        const whatsappUrl = `https://wa.me/91${selectedEntity.contact.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const PartyList = ({ list, balances, onSelect, selectedId }: any) => (
        <>
            {list.map((party: any) => {
                const balance = balances.get(party.id) || 0;
                const balanceColor = balance > 0 ? 'text-red-600' : 'text-green-600';
                const balanceText = activeView === 'customers'
                    ? (balance > 0 ? 'Dena Hai' : 'Settled')
                    : (balance > 0 ? 'Lena Hai' : 'Settled');
                return (
                    <button key={party.id} onClick={() => onSelect(party.id)} className={`w-full text-left p-4 rounded-xl transition-colors flex justify-between items-center ${selectedId === party.id ? 'bg-emerald-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <div>
                            <p className="font-semibold text-slate-800">{party.name}</p>
                            <p className="text-sm text-slate-500">{party.contact}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold text-lg ${balanceColor}`}>{formatCurrency(balance)}</p>
                            <p className="text-xs text-slate-400">{balanceText}</p>
                        </div>
                    </button>
                )
            })}
        </>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AddCustomerModal isOpen={isAddPartyModalOpen} onClose={() => setAddPartyModalOpen(false)} onAdd={handleAddParty} partyType={activeView === 'customers' ? 'Customer' : 'Supplier'} />
            <AddTransactionModal isOpen={isAddTransactionModalOpen} onClose={() => setAddTransactionModalOpen(false)} onAddTransaction={handleAddTransaction} transactionType={transactionModalType} partyType={activeView === 'customers' ? 'Customer' : 'Supplier'} />
            <KhataReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} customerTransactions={customerTransactions} customers={customers} supplierTransactions={supplierTransactions} suppliers={suppliers} />

            {/* Left Column: List */}
            <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-lg h-full flex flex-col">
                <div className="p-2">
                    <div className="flex justify-center bg-slate-100 p-1 rounded-lg mb-4">
                        <button onClick={() => setActiveView('customers')} className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'customers' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Customers</button>
                        <button onClick={() => setActiveView('suppliers')} className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'suppliers' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Suppliers</button>
                    </div>
                    <div className="relative mb-4">
                        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder={`Search ${activeView}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setAddPartyModalOpen(true)} className="flex-1 bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition flex items-center justify-center gap-2">
                            <IconUserPlus /> Add {activeView === 'customers' ? 'Customer' : 'Supplier'}
                        </button>
                         <button onClick={() => setReportModalOpen(true)} className="shrink-0 bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition flex items-center justify-center gap-2">
                            <IconFileText /> Reports
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 mt-4 space-y-2 pr-2">
                   {activeView === 'customers' 
                        ? <PartyList list={filteredCustomers} balances={customerBalances} onSelect={setSelectedId} selectedId={selectedId} />
                        : <PartyList list={filteredSuppliers} balances={supplierBalances} onSelect={setSelectedId} selectedId={selectedId} />
                   }
                </div>
            </div>

            {/* Right Column: Ledger */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg h-full">
                {selectedEntity ? (
                    <div className="flex flex-col h-full">
                        <div className="pb-4 border-b border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-2xl font-bold text-slate-800">{selectedEntity.name}</h2>
                                <span className={`text-2xl font-bold ${selectedBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(selectedBalance)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-slate-500 flex items-center gap-2"><IconPhone /> {selectedEntity.contact}</p>
                                <p className={`font-semibold ${selectedBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {selectedBalance > 0 ? (activeView === 'customers' ? "Outstanding Balance" : "Amount to Pay") : "Account Settled"}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 py-4">
                            <button onClick={() => openTransactionModal(TransactionType.Credit)} className="flex-1 bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2"><IconPlus/> {activeView === 'customers' ? 'Add Credit (Udhaar)' : 'Add Purchase'}</button>
                            <button onClick={() => openTransactionModal(TransactionType.Debit)} className="flex-1 bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2"><IconCheck/> {activeView === 'customers' ? 'Add Payment (Jama)' : 'Make Payment'}</button>
                        </div>
                        
                        {selectedBalance > 0 && activeView === 'customers' && (
                            <button onClick={handleSendReminder} className="w-full bg-green-100 text-green-800 font-bold py-2.5 px-4 rounded-xl hover:bg-green-200 transition flex items-center justify-center gap-2 text-sm mb-4">
                                <IconWhatsApp className="w-4 h-4"/> Send Payment Reminder
                            </button>
                        )}
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                           {selectedTransactions.map((t: any) => (
                               <div key={t.id} className="p-4 rounded-xl bg-slate-50">
                                   <div className="flex items-start gap-4">
                                       {t.type === TransactionType.Credit ? <IconArrowUpCircle /> : <IconArrowDownCircle />}
                                       <div className="flex-1">
                                           <div className="flex justify-between items-baseline">
                                               <p className={`font-semibold ${t.type === TransactionType.Credit ? 'text-red-700' : 'text-green-700'}`}>{t.type}</p>
                                               <p className={`font-bold text-lg ${t.type === TransactionType.Credit ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(t.amount)}</p>
                                           </div>
                                            <div className="flex justify-between items-baseline text-sm">
                                                <p className="text-slate-500 italic flex-1 break-words">{t.notes}</p>
                                                <p className="text-slate-400 pl-2">{new Date(t.date).toLocaleDateString('en-GB')}</p>
                                            </div>
                                       </div>
                                   </div>
                                   {t.photos && t.photos.length > 0 && (
                                       <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-200 w-full">
                                           {t.photos.map((photo, idx) => (
                                               <a href={photo} target="_blank" rel="noopener noreferrer" key={idx} className="block">
                                                   <img src={photo} alt={`Attachment ${idx + 1}`} className="h-16 w-16 object-cover rounded-md border border-slate-200 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all" />
                                               </a>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <IconBookOpen />
                        <h3 className="mt-4 text-xl font-semibold">Select a {activeView === 'customers' ? 'customer' : 'supplier'}</h3>
                        <p>Choose from the list to view transaction history.</p>
                    </div>
                )}
            </div>
        </div>
    )
}