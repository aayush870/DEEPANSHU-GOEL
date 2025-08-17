import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { TraderClient, TraderClientData } from '../../../types';

export const AddEditPartyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSaveParty: (party: Omit<TraderClientData, 'id'>, id?: string) => void;
    partyToEdit: TraderClient | null;
    existingRoutes: string[];
    teamMembers: string[];
    onDeleteParty: (id: string) => void;
}> = ({ isOpen, onClose, onSaveParty, partyToEdit, existingRoutes, teamMembers, onDeleteParty }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [route, setRoute] = useState('');
    const [balance, setBalance] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const isEditing = partyToEdit !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && partyToEdit) {
                setName(partyToEdit.name);
                setPhone(partyToEdit.phone);
                setRoute(partyToEdit.route);
                setBalance(String(partyToEdit.outstandingBalance || ''));
                setAssignedTo(partyToEdit.assignedTo || '');
            } else {
                setName('');
                setPhone('');
                setRoute('');
                setBalance('');
                setAssignedTo('');
            }
        }
    }, [isOpen, partyToEdit, isEditing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && phone.trim() && route.trim()) {
            onSaveParty({
                name: name.trim(),
                phone: phone.trim(),
                route: route.trim(),
                outstandingBalance: parseFloat(balance) || 0,
                assignedTo: assignedTo || undefined,
                status: partyToEdit?.status || 'Regular', // Retain status on edit
            }, partyToEdit?.id);
        }
    };
    
    const handleDelete = () => {
        if (partyToEdit && window.confirm('Are you sure you want to delete this party? This action cannot be undone.')) {
            onDeleteParty(partyToEdit.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Party' : 'Add New Party'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="partyName" className="text-sm font-semibold text-slate-600 mb-1 block">Party Name</label>
                    <input id="partyName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Star Pharmacy" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                <div>
                    <label htmlFor="partyContact" className="text-sm font-semibold text-slate-600 mb-1 block">Contact Number</label>
                    <input id="partyContact" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., 9876543210" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                <div>
                    <label htmlFor="partyRoute" className="text-sm font-semibold text-slate-600 mb-1 block">Route</label>
                    <input id="partyRoute" list="existing-routes" type="text" value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g., NOIDA EXTN" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                    <datalist id="existing-routes">
                        {existingRoutes.map(r => <option key={r} value={r} />)}
                    </datalist>
                    <p className="text-xs text-slate-500 mt-1.5 px-1">You can type to create a new route if it's not in the list.</p>
                </div>
                <div>
                    <label htmlFor="outstandingBalance" className="text-sm font-semibold text-slate-600 mb-1 block">Outstanding Balance (Optional)</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">₹</span>
                        <input id="outstandingBalance" type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                    </div>
                </div>
                <div>
                    <label htmlFor="partyAssignee" className="text-sm font-semibold text-slate-600 mb-1 block">Assign To (Optional)</label>
                    <select id="partyAssignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none text-slate-900">
                        <option value="" className="text-black">Unassigned</option>
                        {teamMembers.map(tm => <option key={tm} value={tm} className="text-black">{tm}</option>)}
                    </select>
                </div>
                <div className="pt-2">
                    <div className="flex flex-col gap-2">
                         <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">
                            {isEditing ? 'Save Changes' : 'Add Party'}
                        </button>
                         {isEditing && (
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                className="w-full bg-transparent text-red-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-all"
                            >
                                Delete Party
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
};