import React, { useState, useMemo } from 'react';
import { AyushmanClient, AyushmanTask, AyushmanTaskCategory } from '../../types';
import { 
    IconBuildingOffice2, IconCalendar, IconCheckboxUnchecked, IconCheckboxChecked, IconTrash 
} from '../../assets/icons';

const categoryStyles: Record<AyushmanTaskCategory, string> = {
    [AyushmanTaskCategory.PCD_Infiltration]: 'bg-blue-100 text-blue-800 border-blue-200',
    [AyushmanTaskCategory.AyushServe]: 'bg-purple-100 text-purple-800 border-purple-200',
    [AyushmanTaskCategory.Vertex_Supplies]: 'bg-amber-100 text-amber-800 border-amber-200',
};

const TaskBoardCard: React.FC<{
    task: AyushmanTask & { clientName: string; clientId: string };
    onToggle: () => void;
    onDelete: () => void;
    onClientClick: () => void;
}> = ({ task, onToggle, onDelete, onClientClick }) => {
    const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date(new Date().toDateString());

    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 transition-all ${task.isCompleted ? 'bg-slate-100 opacity-70' : 'bg-white shadow-sm'}`}>
            <button onClick={onToggle} className="flex-shrink-0 mt-1">
                {task.isCompleted ? <IconCheckboxChecked className="text-green-600"/> : <IconCheckboxUnchecked className="text-slate-400"/>}
            </button>
            <div className="flex-grow">
                <p className={`font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
                    <button onClick={onClientClick} className="font-semibold text-purple-600 hover:underline flex items-center gap-1">
                        <IconBuildingOffice2 className="w-4 h-4" /> {task.clientName}
                    </button>
                    <span className={`font-semibold px-2 py-0.5 rounded-full border ${categoryStyles[task.category]}`}>
                        {task.category}
                    </span>
                    <p className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                        <IconCalendar className="w-4 h-4"/> 
                        {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </div>
            <button onClick={onDelete} className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full">
                <IconTrash/>
            </button>
        </div>
    );
};

export const TaskBoard: React.FC<{
    clients: AyushmanClient[];
    onToggleTask: (clientId: string, taskId: string) => void;
    onDeleteTask: (clientId: string, taskId: string) => void;
    onClientClick: (clientId: string) => void;
}> = ({ clients, onToggleTask, onDeleteTask, onClientClick }) => {
    const [activeCategory, setActiveCategory] = useState<'All' | AyushmanTaskCategory>('All');

    const allTasks = useMemo(() => {
        return clients.flatMap(client => 
          client.tasks.map(task => ({
            ...task,
            clientName: client.hospitalName,
            clientId: client.id,
          }))
        );
    }, [clients]);

    const filteredTasks = useMemo(() => {
        return (activeCategory === 'All' ? allTasks : allTasks.filter(t => t.category === activeCategory))
            .sort((a,b) => {
                if(a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [allTasks, activeCategory]);
    
    const categories = ['All', ...Object.values(AyushmanTaskCategory)];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Task Board</h2>
            <p className="text-slate-500 mb-6">A central place to view all tasks across all clients.</p>
            
            <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
                {categories.map(cat => {
                    const count = cat === 'All' ? allTasks.length : allTasks.filter(t => t.category === cat).length;
                    const isActive = activeCategory === cat;
                    return (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat as any)}
                            className={`px-3 py-2 font-semibold text-sm rounded-t-lg transition-colors whitespace-nowrap ${isActive ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {cat} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
                        </button>
                    )
                })}
            </div>

            <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
                {filteredTasks.length > 0 ? filteredTasks.map(task => (
                    <TaskBoardCard 
                        key={task.id} 
                        task={task} 
                        onToggle={() => onToggleTask(task.clientId, task.id)}
                        onDelete={() => onDeleteTask(task.clientId, task.id)}
                        onClientClick={() => onClientClick(task.clientId)}
                    />
                )) : (
                    <div className="text-center py-16 text-slate-500">
                        <p className="font-semibold">No tasks found.</p>
                        <p className="text-sm">Try selecting a different category or adding new tasks to a client.</p>
                    </div>
                )}
            </div>
        </div>
    );
};