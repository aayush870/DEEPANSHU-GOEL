import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { Sidebar } from '../components/common/Sidebar';

// Import all page components
import { PharmacyDeliveries } from './pharmacy/PharmacyDeliveries';
import { KhataBook } from './pharmacy/KhataBook';
import { CallManagement } from './traders/CallManagement';
import { PendingPayments } from './traders/PendingPayments';
import { TodoList } from './traders/TodoList';
import { StaffAttendance } from './traders/StaffAttendance';
import { ExpenseTracker } from './traders/ExpenseTracker';
import { TaskBoard } from './ayushman/TaskBoard';
import { AyushmanClientManager } from './ayushman/AyushmanClientManager';


// Import types
import {
    TraderClient, TraderClientData, TodoItem, TodoStatus, TodoType, StaffMember, AttendanceStatus, AttendanceRecord,
    SalaryTransaction, SalaryChangeLog, ExpenseItem, AyushmanClient, AyushmanTask, AyushmanClientStatus, AyushmanTaskCategory
} from '../types/index';

// Import initial data
import { 
    initialTodos, traderClientsData, initialStaffMembers, initialAttendanceRecords, initialSalaryLedger, 
    initialSalaryChangeHistory, initialExpenses, initialAyushmanClients
} from '../assets/data';

// Import modals
import { AddEditPartyModal } from './traders/components/AddEditPartyModal';
import { AddTodoModal } from './traders/components/AddTodoModal';

export type ActivePage = 
    | 'deliveries' 
    | 'khata'
    | 'ayushman_clients'
    | 'ayushman_tasks'
    | 'calls'
    | 'payments'
    | 'todos'
    | 'staff'
    | 'expenses';

const App = () => {
    // Centralized state management
    const [activePage, setActivePage] = useLocalStorageState<ActivePage>('activePage_v2', 'deliveries');

    // --- Traders App State ---
    const [clients, setClients] = useLocalStorageState<TraderClient[]>('trader_clients_data_v3', () => traderClientsData.map(c => ({ ...c, callState: 'pending' })));
    const [todos, setTodos] = useLocalStorageState<TodoItem[]>('trader_todos', initialTodos);
    const [staff, setStaff] = useLocalStorageState<StaffMember[]>('staff_members', initialStaffMembers);
    const [attendanceRecords, setAttendanceRecords] = useLocalStorageState<AttendanceRecord[]>('staff_attendance', initialAttendanceRecords);
    const [salaryLedger, setSalaryLedger] = useLocalStorageState<SalaryTransaction[]>('staff_salary_ledger', initialSalaryLedger);
    const [salaryChangeHistory, setSalaryChangeHistory] = useLocalStorageState<SalaryChangeLog[]>('staff_salary_change_history', initialSalaryChangeHistory);
    const [expenses, setExpenses] = useLocalStorageState<ExpenseItem[]>('expense_tracker_items', initialExpenses);
    
    // --- Ayushman App State ---
    const [ayushmanClients, setAyushmanClients] = useLocalStorageState<AyushmanClient[]>('ayushman_clients', initialAyushmanClients);

    // --- Modals State ---
    const [isAddEditPartyModalOpen, setIsAddEditPartyModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<TraderClient | null>(null);
    const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
    
    // --- Memos ---
    const teamMembers = useMemo(() => staff.map(s => s.name), [staff]);
    const existingRoutes = useMemo(() => Array.from(new Set(clients.map(c => c.route))), [clients]);

    // --- Traders App Logic / Handlers ---

    // Reset daily states at midnight
    useEffect(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const timer = setTimeout(() => {
            setClients(prev => prev.map(c => ({ ...c, callState: 'pending', followUpAt: undefined })));
            setTodos(prev => prev.map(t => t.type === TodoType.Daily ? {...t, status: TodoStatus.ToDo, completedAt: undefined } : t));
        }, msUntilMidnight);

        return () => clearTimeout(timer);
    }, [setClients, setTodos]);

    const handleMarkComplete = useCallback((id: string) => setClients(prev => prev.map(c => c.id === id ? { ...c, callState: 'completed', followUpAt: undefined } : c)), [setClients]);
    const handleSetFollowUp = useCallback((id: string, delayMs: number) => setClients(prev => prev.map(c => c.id === id ? { ...c, callState: 'follow-up', followUpAt: Date.now() + delayMs } : c)), [setClients]);
    const handleReset = useCallback((id: string) => setClients(prev => prev.map(c => c.id === id ? { ...c, callState: 'pending', followUpAt: undefined } : c)), [setClients]);
    const handleAddComment = useCallback((id: string, text: string) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, comments: [{ text, date: Date.now() }, ...(c.comments || [])] } : c));
    }, [setClients]);
    const handleAssign = useCallback((id: string, assignee: string) => setClients(prev => prev.map(c => c.id === id ? { ...c, assignedTo: assignee || undefined } : c)), [setClients]);
    
    const handleOpenAddPartyModal = () => { setEditingParty(null); setIsAddEditPartyModalOpen(true); };
    const handleOpenEditPartyModal = (party: TraderClient) => { setEditingParty(party); setIsAddEditPartyModalOpen(true); };
    const handleClosePartyModal = () => { setIsAddEditPartyModalOpen(false); setEditingParty(null); };

    const handleSaveParty = (partyData: Omit<TraderClientData, 'id'>, id?: string) => {
        if (id) {
            setClients(prev => prev.map(c => c.id === id ? { ...c, ...partyData } : c));
        } else {
            const newParty: TraderClient = { id: `t-${Date.now()}`, ...partyData, callState: 'pending' };
            setClients(prev => [newParty, ...prev]);
        }
        handleClosePartyModal();
    };
    
    const handleDeleteParty = (id: string) => { setClients(prev => prev.filter(c => c.id !== id)); };

    const handleAddTodo = (todoData: Omit<TodoItem, 'id'|'status'|'createdAt'>) => {
        const newTodo: TodoItem = { id: `todo-${Date.now()}`, ...todoData, status: TodoStatus.ToDo, createdAt: Date.now() };
        setTodos(prev => [newTodo, ...prev]);
    };

    const handleUpdateTodoStatus = (id: string, newStatus: TodoStatus) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, completedAt: newStatus === TodoStatus.Completed ? Date.now() : undefined } : t));
    };
    
    const handleDeleteStaff = (id: string, name: string): boolean => {
        if (window.confirm(`Are you sure you want to delete ${name}? All associated records will be removed. This cannot be undone.`)) {
            setStaff(prev => prev.filter(s => s.id !== id));
            setAttendanceRecords(prev => prev.filter(r => r.staffId !== id));
            setSalaryLedger(prev => prev.filter(t => t.staffId !== id));
            setSalaryChangeHistory(prev => prev.filter(log => log.staffId !== id));
            setTodos(prev => prev.map(t => t.assignedTo === name ? { ...t, assignedTo: 'Unassigned' } : t));
            setClients(prev => prev.map(c => c.assignedTo === name ? { ...c, assignedTo: undefined } : c));
            return true;
        }
        return false;
    };
    
    // --- Ayushman App Logic / Handlers ---
    const handleToggleAyushmanTask = (clientId: string, taskId: string) => {
        setAyushmanClients(prev => prev.map(c => {
            if (c.id === clientId) {
                return { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) };
            }
            return c;
        }));
    };
    
    const handleDeleteAyushmanTask = (clientId: string, taskId: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        setAyushmanClients(prev => prev.map(c => c.id === clientId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c));
    };

    const handleClientClickFromBoard = (clientId: string) => {
        setActivePage('ayushman_clients');
    };


    const renderActiveApp = () => {
        switch(activePage) {
            case 'deliveries': return <PharmacyDeliveries />;
            case 'khata': return <KhataBook />;
            case 'ayushman_clients': return <AyushmanClientManager clients={ayushmanClients} setClients={setAyushmanClients} />;
            case 'ayushman_tasks': return <TaskBoard clients={ayushmanClients} onToggleTask={handleToggleAyushmanTask} onDeleteTask={handleDeleteAyushmanTask} onClientClick={handleClientClickFromBoard} />;
            case 'calls': return <CallManagement clients={clients} teamMembers={teamMembers} onMarkComplete={handleMarkComplete} onSetFollowUp={handleSetFollowUp} onReset={handleReset} onAddComment={handleAddComment} onAddNewParty={handleOpenAddPartyModal} onEditParty={handleOpenEditPartyModal} />;
            case 'payments': return <PendingPayments clients={clients} teamMembers={teamMembers} onAssign={handleAssign} setClients={setClients} onAddNewParty={handleOpenAddPartyModal} />;
            case 'todos': return <TodoList todos={todos} teamMembers={teamMembers} onUpdateStatus={handleUpdateTodoStatus} onAddNewTodo={() => setIsAddTodoModalOpen(true)} onNavigateToStaff={() => setActivePage('staff')} onNavigateToExpenses={() => setActivePage('expenses')} />;
            case 'staff': return <StaffAttendance staff={staff} setStaffMembers={setStaff} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} salaryLedger={salaryLedger} setSalaryLedger={setSalaryLedger} salaryChangeHistory={salaryChangeHistory} setSalaryChangeHistory={setSalaryChangeHistory} onDeleteStaff={handleDeleteStaff} onBack={() => setActivePage('todos')} />;
            case 'expenses': return <ExpenseTracker expenses={expenses} setExpenses={setExpenses} onBack={() => setActivePage('todos')} />;
            default: return <PharmacyDeliveries />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderActiveApp()}
                </main>
                <footer className="py-4 text-center text-slate-400 text-xs print:hidden">
                    <p>&copy; {new Date().getFullYear()} Shri Kripa. All rights reserved.</p>
                </footer>
            </div>
            
            {/* Centralized Modals */}
            <AddEditPartyModal isOpen={isAddEditPartyModalOpen} onClose={handleClosePartyModal} onSaveParty={handleSaveParty} partyToEdit={editingParty} existingRoutes={existingRoutes} teamMembers={teamMembers} onDeleteParty={handleDeleteParty} />
            <AddTodoModal isOpen={isAddTodoModalOpen} onClose={() => setIsAddTodoModalOpen(false)} onAddTodo={handleAddTodo} teamMembers={teamMembers} />
        </div>
    );
};

export default App;