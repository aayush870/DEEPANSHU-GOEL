import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { StaffMember } from '../../../types';

export const AddEditStaffModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (staffData: Omit<StaffMember, 'id'>, existingId?: string) => void;
    staffMember: StaffMember | null;
    onDelete: (id: string, name: string) => boolean;
}> = ({ isOpen, onClose, onSave, staffMember, onDelete }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [monthlySalary, setMonthlySalary] = useState('');

    const isEditing = staffMember !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && staffMember) {
                setName(staffMember.name);
                setRole(staffMember.role);
                setPhone(staffMember.phone);
                setMonthlySalary(String(staffMember.monthlySalary));
            } else {
                setName('');
                setRole('');
                setPhone('');
                setMonthlySalary('');
            }
        }
    }, [isOpen, staffMember, isEditing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const salary = parseFloat(monthlySalary);
        if (name.trim() && role.trim() && phone.trim() && !isNaN(salary) && salary > 0) {
            onSave(
                { name: name.trim(), role: role.trim(), phone: phone.trim(), monthlySalary: salary },
                isEditing ? staffMember.id : undefined
            );
            onClose();
        }
    };
    
    const handleDelete = () => {
        if (staffMember) {
            const wasDeleted = onDelete(staffMember.id, staffMember.name);
            if (wasDeleted) {
                onClose();
            }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Staff Profile' : 'Add New Staff Member'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="staffName" className="text-sm font-semibold text-slate-600 mb-1 block">Staff Name</label>
                    <input id="staffName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John Doe" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                <div>
                    <label htmlFor="staffRole" className="text-sm font-semibold text-slate-600 mb-1 block">Role / Position</label>
                    <input id="staffRole" type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., Sales Executive" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                <div>
                    <label htmlFor="staffContact" className="text-sm font-semibold text-slate-600 mb-1 block">Contact Information</label>
                    <input id="staffContact" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., 9876543210" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                 <div>
                    <label htmlFor="staffSalary" className="text-sm font-semibold text-slate-600 mb-1 block">Base Monthly Salary (₹)</label>
                    <input id="staffSalary" type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} placeholder="e.g., 45000" required min="0" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                <div className="pt-2">
                     <div className="flex flex-col gap-2">
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">
                            {isEditing ? 'Save Changes' : 'Add Staff Member'}
                        </button>
                         {isEditing && (
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                className="w-full bg-transparent text-red-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-all"
                            >
                                Delete Staff Member
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
};