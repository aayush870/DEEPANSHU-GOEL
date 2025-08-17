import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { TodoItem, TodoType } from '../../../types';

export const AddTodoModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddTodo: (task: Omit<TodoItem, 'id' | 'status' | 'createdAt'>) => void;
    teamMembers: string[];
}> = ({ isOpen, onClose, onAddTodo, teamMembers }) => {
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState(teamMembers[0] || '');
    const [type, setType] = useState<TodoType>(TodoType.Daily);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && assignedTo) {
            onAddTodo({ title: title.trim(), assignedTo, type });
            setTitle('');
            setAssignedTo(teamMembers[0] || '');
            setType(TodoType.Daily);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="taskTitle" className="text-sm font-semibold text-slate-600 mb-1 block">Task Title</label>
                    <textarea id="taskTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Follow up with high-priority clients" required rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900" />
                </div>
                 <div>
                    <label htmlFor="taskAssignee" className="text-sm font-semibold text-slate-600 mb-1 block">Assign To</label>
                    <select id="taskAssignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none text-slate-900">
                        {teamMembers.map(tm => <option key={tm} value={tm} className="text-black">{tm}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">Task Type</label>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <button type="button" onClick={() => setType(TodoType.Daily)} className={`flex-1 text-center py-1.5 rounded-md font-semibold text-sm transition-all ${type === TodoType.Daily ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Daily</button>
                        <button type="button" onClick={() => setType(TodoType.Monthly)} className={`flex-1 text-center py-1.5 rounded-md font-semibold text-sm transition-all ${type === TodoType.Monthly ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>Monthly</button>
                    </div>
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">Add Task</button>
                </div>
            </form>
        </Modal>
    );
};