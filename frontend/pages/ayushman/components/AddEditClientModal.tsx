import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { AyushmanClient, AyushmanClientStatus } from '../../../types';

export const AddEditClientModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (clientData: Omit<AyushmanClient, 'id' | 'tasks' | 'notes'>, id?: string) => void;
    clientToEdit: AyushmanClient | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [hospitalName, setHospitalName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<AyushmanClientStatus>('Prospect');
    
    const isEditing = clientToEdit !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && clientToEdit) {
                setHospitalName(clientToEdit.hospitalName);
                setContactPerson(clientToEdit.contactPerson);
                setPhone(clientToEdit.phone);
                setAddress(clientToEdit.address);
                setStatus(clientToEdit.status);
            } else {
                setHospitalName('');
                setContactPerson('');
                setPhone('');
                setAddress('');
                setStatus('Prospect');
            }
        }
    }, [isOpen, clientToEdit, isEditing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hospitalName.trim() && contactPerson.trim() && phone.trim()) {
            onSave({ hospitalName, contactPerson, phone, address, status }, clientToEdit?.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Client' : 'Add New Client'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="Hospital/Clinic Name" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900" />
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Contact Person" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900" />
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900" />
                <select value={status} onChange={e => setStatus(e.target.value as AyushmanClientStatus)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-slate-900">
                    {['Prospect', 'Active', 'Inactive'].map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                </select>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50">
                        {isEditing ? 'Save Changes' : 'Add Client'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};