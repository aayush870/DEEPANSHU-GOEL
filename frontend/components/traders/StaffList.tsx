import React from 'react';
import { StaffMember } from '../../types';
import { IconUserPlus, IconPencil } from '../../assets/icons';

interface StaffListProps {
    staff: StaffMember[];
    selectedStaffId: string | null;
    setSelectedStaffId: (id: string) => void;
    onOpenAddStaffModal: () => void;
    onOpenEditStaffModal: (staff: StaffMember) => void;
}

export const StaffList: React.FC<StaffListProps> = ({
    staff,
    selectedStaffId,
    setSelectedStaffId,
    onOpenAddStaffModal,
    onOpenEditStaffModal
}) => {
    return (
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center p-2 mb-2">
                <h3 className="text-lg font-bold text-slate-800">Staff List</h3>
                <button
                    onClick={onOpenAddStaffModal}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 font-semibold text-xs px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    aria-label="Add New Staff Member"
                >
                    <IconUserPlus /> Add Staff
                </button>
            </div>
            <div className="overflow-y-auto flex-1 mt-2 space-y-2 pr-2">
                {staff.map(member => (
                    <button key={member.id} onClick={() => setSelectedStaffId(member.id)} className={`w-full text-left p-4 rounded-xl transition-colors flex justify-between items-center ${selectedStaffId === member.id ? 'bg-blue-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <div>
                            <p className="font-semibold text-slate-800">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.role}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenEditStaffModal(member); }}
                            className="p-2 text-slate-500 hover:bg-slate-200 hover:text-blue-600 rounded-full"
                            aria-label={`Edit ${member.name}`}
                        >
                            <IconPencil />
                        </button>
                    </button>
                ))}
            </div>
        </div>
    );
};