import React, { useState, useMemo, useEffect } from 'react';
import { AyushmanClient, AyushmanTask, AyushmanClientStatus, AyushmanTaskCategory } from '../../types';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { getTodayDateString } from '../../utils/helpers';
import { DatePicker } from '../traders/pickers/DatePicker';
import { 
    IconBuildingOffice2, IconSearch, IconUserPlus, IconPencil, IconPlus, IconTrash, 
    IconPhone, IconUser, IconMapPin, IconCalendar, IconCheckboxUnchecked, IconCheckboxChecked,
    IconMessageCircle
} from '../../assets/icons';
import { AddEditClientModal } from './components/AddEditClientModal';

interface AyushmanClientManagerProps {
    clients: AyushmanClient[];
    setClients: React.Dispatch<React.SetStateAction<AyushmanClient[]>>;
}

export const AyushmanClientManager: React.FC<AyushmanClientManagerProps> = ({ clients, setClients }) => {
    const [selectedClientId, setSelectedClientId] = useState<string | null>(clients.length > 0 ? clients[0].id : null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<AyushmanClient | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState(getTodayDateString());
    const [newTaskCategory, setNewTaskCategory] = useState<AyushmanTaskCategory>(AyushmanTaskCategory.PCD_Infiltration);

    const handleSaveClient = (clientData: Omit<AyushmanClient, 'id' | 'tasks' | 'notes'>, id?: string) => {
        if (id) {
            setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
        } else {
            const newClient: AyushmanClient = { ...clientData, id: `ayu-${Date.now()}`, tasks: [], notes: '' };
            setClients(prev => [newClient, ...prev]);
            setSelectedClientId(newClient.id);
        }
    };

    const handleUpdateStatus = (clientId: string, newStatus: AyushmanClientStatus) => {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    };

    const handleAddTask = () => {
        if (!newTaskDesc.trim() || !selectedClientId) return;
        const newTask: AyushmanTask = {
            id: `task-${Date.now()}`,
            description: newTaskDesc.trim(),
            dueDate: newTaskDueDate,
            isCompleted: false,
            category: newTaskCategory,
        };
        setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, tasks: [newTask, ...c.tasks] } : c));
        setNewTaskDesc('');
        setNewTaskDueDate(getTodayDateString());
        setNewTaskCategory(AyushmanTaskCategory.PCD_Infiltration);
    };

    const handleToggleTask = (clientId: string, taskId: string) => {
        setClients(prev => prev.map(c => {
            if (c.id === clientId) {
                return { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) };
            }
            return c;
        }));
    };
    
    const handleDeleteTask = (clientId: string, taskId: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        setClients(prev => prev.map(c => {
            if(c.id === clientId) {
                return {...c, tasks: c.tasks.filter(t => t.id !== taskId) };
            }
            return c;
        }));
    };

    const handleUpdateNotes = (notes: string) => {
        setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, notes } : c));
    };

    const filteredClients = useMemo(() => {
        return clients.filter(c => c.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [clients, searchQuery]);
    
    useEffect(() => {
        if (!selectedClientId && filteredClients.length > 0) {
            setSelectedClientId(filteredClients[0].id)
        }
        if (selectedClientId && !filteredClients.some(c => c.id === selectedClientId)) {
             setSelectedClientId(filteredClients.length > 0 ? filteredClients[0].id : null)
        }
    }, [filteredClients, selectedClientId]);

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

    const statusStyles: Record<AyushmanClientStatus, string> = {
        Active: 'bg-green-100 text-green-800',
        Prospect: 'bg-blue-100 text-blue-800',
        Inactive: 'bg-slate-200 text-slate-700',
    };

    const categoryStyles: Record<AyushmanTaskCategory, string> = {
        [AyushmanTaskCategory.PCD_Infiltration]: 'bg-blue-100 text-blue-800 border-blue-200',
        [AyushmanTaskCategory.AyushServe]: 'bg-purple-100 text-purple-800 border-purple-200',
        [AyushmanTaskCategory.Vertex_Supplies]: 'bg-amber-100 text-amber-800 border-amber-200',
    };

    return (
        <div>
            <DatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                selectedDate={newTaskDueDate}
                onDateSelect={(date) => {
                    setNewTaskDueDate(date);
                    setIsDatePickerOpen(false);
                }}
                allowFutureDates={true}
            />
            
            <AddEditClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} clientToEdit={editingClient} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Client List */}
                <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-12rem)]">
                    <div className="p-2">
                        <div className="relative mb-4">
                            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder="Search hospitals..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-slate-900" />
                        </div>
                        <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="w-full bg-purple-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2">
                            <IconUserPlus /> Add New Client
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 mt-4 space-y-2 pr-2">
                    {filteredClients.map(client => (
                        <button key={client.id} onClick={() => setSelectedClientId(client.id)} className={`w-full text-left p-4 rounded-xl transition-colors flex justify-between items-center ${selectedClientId === client.id ? 'bg-purple-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                            <div>
                                <p className="font-semibold text-slate-800">{client.hospitalName}</p>
                                <p className="text-sm text-slate-500">{client.address}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyles[client.status]}`}>{client.status}</span>
                        </button>
                    ))}
                    </div>
                </div>

                {/* Right Panel: Client Details & Tasks */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg h-[calc(100vh-12rem)] overflow-y-auto">
                    {selectedClient ? (
                        <div className="flex flex-col h-full">
                            <div className="pb-4 border-b border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedClient.hospitalName}</h2>
                                    <button onClick={() => { setEditingClient(selectedClient); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><IconPencil/></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                        {(['Active', 'Prospect', 'Inactive'] as AyushmanClientStatus[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdateStatus(selectedClient.id, s)}
                                                className={`flex-1 text-center py-1.5 rounded-md font-semibold text-sm transition-all ${selectedClient.status === s ? `shadow ${statusStyles[s]}` : 'text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-3 text-slate-600">
                                        <p className="flex items-center gap-3"><IconUser className="w-5 h-5 text-slate-400" /> {selectedClient.contactPerson}</p>
                                        <p className="flex items-center gap-3"><IconPhone className="w-5 h-5" /> {selectedClient.phone}</p>
                                        <p className="flex items-center gap-3"><IconMapPin className="w-5 h-5 text-slate-400" /> {selectedClient.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-4 space-y-2">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><IconMessageCircle /> Notes</h3>
                            <textarea 
                                value={selectedClient.notes || ''}
                                onChange={(e) => handleUpdateNotes(e.target.value)}
                                placeholder="Add notes about this client..."
                                className="w-full h-24 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-900"
                            />
                            </div>

                            <div className="flex-1 flex flex-col min-h-0 pt-4 border-t border-slate-200">
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Tasks</h3>
                            <div className="space-y-3 mb-4">
                                <input 
                                    type="text" 
                                    value={newTaskDesc} 
                                    onChange={e => setNewTaskDesc(e.target.value)} 
                                    placeholder="New task description..." 
                                    className="w-full px-4 py-2 bg-slate-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900"
                                />
                                <div className="flex gap-2">
                                    <select 
                                        value={newTaskCategory} 
                                        onChange={e => setNewTaskCategory(e.target.value as AyushmanTaskCategory)} 
                                        className="flex-grow px-4 py-2 bg-slate-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 appearance-none"
                                    >
                                        {Object.values(AyushmanTaskCategory).map(cat => <option className="text-black" key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsDatePickerOpen(true)}
                                        className="w-44 flex-shrink-0 px-4 py-2 bg-slate-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 flex items-center justify-between text-left"
                                    >
                                        <span className="text-sm">
                                            {new Date(newTaskDueDate.replace(/-/g, '\/')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <IconCalendar className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button 
                                        onClick={handleAddTask} 
                                        className="bg-purple-500 text-white font-bold p-2.5 rounded-lg hover:bg-purple-600 disabled:bg-purple-300" 
                                        disabled={!newTaskDesc.trim()}
                                    >
                                        <IconPlus/>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto space-y-3 pr-2">
                                {selectedClient.tasks.map(task => (
                                    <div key={task.id} className={`p-3 rounded-lg flex items-center gap-3 ${task.isCompleted ? 'bg-slate-100 opacity-60' : 'bg-purple-50'}`}>
                                        <button onClick={() => handleToggleTask(selectedClient.id, task.id)}>
                                            {task.isCompleted ? <IconCheckboxChecked className="text-green-600"/> : <IconCheckboxUnchecked className="text-slate-500"/>}
                                        </button>
                                        <div className="flex-grow">
                                            <p className={`font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.description}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryStyles[task.category]}`}>
                                                        {task.category}
                                                    </span>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><IconCalendar className="w-4 h-4"/> {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTask(selectedClient.id, task.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full"><IconTrash/></button>
                                    </div>
                                ))}
                            </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                            <IconBuildingOffice2 className="w-16 h-16 text-slate-300"/>
                            <h3 className="mt-4 text-xl font-semibold">Select a Client</h3>
                            <p>Choose a client from the list to see their details and tasks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};