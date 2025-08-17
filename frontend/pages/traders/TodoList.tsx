import React, { useState, useMemo } from 'react';
import { TodoItem, TodoStatus, TodoType } from '../../types/index';
import { 
    IconUser, IconPlus, IconUsers, IconReceipt, IconClipboardList, IconChevronDown, IconCheckCircle
} from '../../assets/icons';

const TodoCard: React.FC<{
    task: TodoItem;
    onUpdateStatus: (id: string, newStatus: TodoStatus) => void;
}> = ({ task, onUpdateStatus }) => {
    const isCompleted = task.status === TodoStatus.Completed;

    const statusColors: Record<TodoStatus, {bg: string, text: string, ring: string}> = {
        [TodoStatus.ToDo]: { bg: 'bg-slate-100', text: 'text-slate-800', ring: 'focus:ring-slate-500' },
        [TodoStatus.InProgress]: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'focus:ring-blue-500' },
        [TodoStatus.Completed]: { bg: 'bg-green-100', text: 'text-green-800', ring: 'focus:ring-green-500' },
    };

    const typeColors: Record<TodoType, string> = {
        [TodoType.Daily]: 'border-sky-300 text-sky-700 bg-sky-50',
        [TodoType.Monthly]: 'border-purple-300 text-purple-700 bg-purple-50',
    };

    return (
        <div className={`p-4 rounded-xl shadow-md space-y-3 transition-opacity ${isCompleted ? 'bg-slate-50 opacity-70' : 'bg-white'}`}>
            <p className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${typeColors[task.type]}`}>{task.type}</span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><IconUser className="w-4 h-4" />{task.assignedTo}</span>
                </div>
                 <div className="relative">
                    <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value as TodoStatus)}
                        disabled={isCompleted}
                        className={`text-xs font-semibold py-1 pl-2 pr-7 rounded-md appearance-none border-none focus:outline-none focus:ring-2 focus:ring-offset-1 ${statusColors[task.status].bg} ${statusColors[task.status].text} ${statusColors[task.status].ring} disabled:opacity-100`}
                        aria-label="Update task status"
                    >
                        {Object.values(TodoStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className={`w-3 h-3 ${statusColors[task.status].text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                </div>
            </div>
        </div>
    );
}

export const TodoList: React.FC<{
    todos: TodoItem[];
    teamMembers: string[];
    onUpdateStatus: (id: string, newStatus: TodoStatus) => void;
    onAddNewTodo: () => void;
    onNavigateToStaff: () => void;
    onNavigateToExpenses: () => void;
}> = ({ todos, teamMembers, onUpdateStatus, onAddNewTodo, onNavigateToStaff, onNavigateToExpenses }) => {
    const [filterAssignee, setFilterAssignee] = useState('All');

    const filteredTodos = useMemo(() => {
        if (filterAssignee === 'All') return todos;
        return todos.filter(t => t.assignedTo === filterAssignee);
    }, [todos, filterAssignee]);

    const columns = useMemo(() => ({
        [TodoStatus.ToDo]: filteredTodos.filter(t => t.status === TodoStatus.ToDo).sort((a,b) => a.createdAt - b.createdAt),
        [TodoStatus.InProgress]: filteredTodos.filter(t => t.status === TodoStatus.InProgress).sort((a,b) => a.createdAt - b.createdAt),
        [TodoStatus.Completed]: filteredTodos.filter(t => t.status === TodoStatus.Completed).sort((a,b) => (b.completedAt || 0) - (a.completedAt || 0)),
    }), [filteredTodos]);
    
    const columnStyles: Record<TodoStatus, { border: string, text: string }> = {
        [TodoStatus.ToDo]: { border: 'border-slate-400', text: 'text-slate-600' },
        [TodoStatus.InProgress]: { border: 'border-blue-500', text: 'text-blue-600' },
        [TodoStatus.Completed]: { border: 'border-green-500', text: 'text-green-600' },
    };

    return (
         <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Team To-Do List</h2>
                <div className="flex items-center gap-3">
                     <div className="relative">
                        <select
                            value={filterAssignee}
                            onChange={e => setFilterAssignee(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-white pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            aria-label="Filter by assignee"
                        >
                            {['All', ...teamMembers].map(assignee => <option key={assignee} value={assignee}>{assignee}</option>)}
                        </select>
                        <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                     <button 
                        onClick={onAddNewTodo}
                        className="flex-shrink-0 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                        <IconPlus /> Add New Task
                    </button>
                    <button
                        onClick={onNavigateToStaff}
                        className="flex-shrink-0 bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                        <IconUsers /> Staff Attendance
                    </button>
                    <button
                        onClick={onNavigateToExpenses}
                        className="flex-shrink-0 bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                        <IconReceipt /> Expenses
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(columns).map(([status, tasks]) => (
                    <div key={status} className="bg-slate-100/70 rounded-xl flex flex-col">
                        <div className={`p-4 border-b-4 ${columnStyles[status as TodoStatus].border}`}>
                             <h3 className={`font-bold text-lg flex items-center gap-2 ${columnStyles[status as TodoStatus].text}`}>
                                {status}
                                <span className="text-sm font-semibold bg-slate-200 text-slate-600 rounded-full px-2.5 py-0.5">{tasks.length}</span>
                            </h3>
                        </div>
                        <div className="p-4 space-y-4 flex-1">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <TodoCard key={task.id} task={task} onUpdateStatus={onUpdateStatus} />
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-500 text-sm">
                                    <p>No tasks in this stage.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
