import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';

export const AddCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, contact: string) => void;
    partyType: 'Customer' | 'Supplier';
}> = ({ isOpen, onClose, onAdd, partyType }) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setContact('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && contact) {
            onAdd(name, contact);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add New ${partyType}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="partyName" className="text-sm font-semibold text-slate-600 mb-1 block">{partyType} Name</label>
                    <input id="partyName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={partyType === 'Customer' ? "e.g., Sunil Verma" : "e.g., MedPlus Distributors"} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                    <label htmlFor="partyContact" className="text-sm font-semibold text-slate-600 mb-1 block">Contact Number</label>
                    <input id="partyContact" type="tel" value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g., 9876543210" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300">Add {partyType}</button>
                </div>
            </form>
        </Modal>
    );
};