import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TraderClient, ClientStatus, CallState, Comment } from '../../types/index';
import { 
    IconTag, IconClock, IconBell, IconCheckCircle, IconRefresh, IconX, IconPhone, IconWhatsApp, IconMapPin, IconUser, IconMessageCircle, IconSearch, IconChevronDown, IconCheck, IconPencil, IconTrash, IconUserPlus, IconRoute, IconPrinter
} from '../../assets/icons';
import { formatRelativeTime, formatCurrency } from '../../utils/helpers';

const ClientStatusTag = ({ status }: { status: ClientStatus }) => {
    const statusStyles: { [key in ClientStatus]: string } = {
        'High Priority': 'bg-red-100 text-red-800 border-red-200',
        'Follow Up': 'bg-amber-100 text-amber-800 border-amber-200',
        'Regular': 'bg-slate-200 text-slate-700 border-slate-300',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${statusStyles[status]}`}>
            <IconTag />
            {status}
        </span>
    );
};

const FollowUpTimer: React.FC<{ followUpAt: number, onEnd: () => void }> = ({ followUpAt, onEnd }) => {
    const calculateTimeLeft = useCallback(() => followUpAt - Date.now(), [followUpAt]);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft <= 0) {
                clearInterval(timer);
                setTimeLeft(0);
                onEnd();
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [followUpAt, onEnd, calculateTimeLeft]);

    const isDue = timeLeft <= 0;

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (isDue) {
        return (
            <div className="flex items-center justify-center gap-2 font-bold text-amber-600 animate-pulse">
                <IconBell className="w-5 h-5" />
                Follow-up is due!
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2 font-semibold text-blue-700">
            <IconClock className="w-5 h-5 text-blue-500" />
            {formatTime(timeLeft)}
        </div>
    );
};

const CustomFollowUpForm: React.FC<{
    onSet: (delayMs: number) => void;
    onCancel: () => void;
}> = ({ onSet, onCancel }) => {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    const handleSet = () => {
        const h = parseInt(hours, 10) || 0;
        const m = parseInt(minutes, 10) || 0;
        if (h === 0 && m === 0) return;
        const delayMs = (h * 3600 + m * 60) * 1000;
        onSet(delayMs);
    };

    const setPreset = (delayMs: number) => {
        onSet(delayMs);
    };
    
    const tomorrowAt9AM = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        onSet(tomorrow.getTime() - now.getTime());
    }

    return (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-center text-slate-600">Set a custom follow-up</p>
            <div className="flex items-center gap-2">
                <input type="number" placeholder="HH" value={hours} onChange={e => setHours(e.target.value)} className="w-full text-center px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" />
                <span className="font-bold text-slate-400">:</span>
                <input type="number" placeholder="MM" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-full text-center px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="59" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => setPreset(30 * 60 * 1000)} className="font-semibold py-1.5 px-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200">30 Mins</button>
                <button onClick={() => setPreset(60 * 60 * 1000)} className="font-semibold py-1.5 px-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200">1 Hour</button>
                <button onClick={() => setPreset(2 * 60 * 60 * 1000)} className="font-semibold py-1.5 px-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200">2 Hours</button>
                <button onClick={tomorrowAt9AM} className="font-semibold py-1.5 px-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200">Tomorrow</button>
            </div>
            <div className="flex items-center gap-2 pt-1">
                <button onClick={onCancel} className="flex-1 text-sm font-semibold py-2 px-4 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                <button onClick={handleSet} className="flex-1 text-sm font-semibold py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Set</button>
            </div>
        </div>
    );
};

const ClientCard: React.FC<{
    client: TraderClient;
    onMarkComplete: (id: string) => void;
    onSetFollowUp: (id: string, delayMs: number) => void;
    onReset: (id: string) => void;
    onAddComment: (id: string, text: string) => void;
    onEdit: (client: TraderClient) => void;
}> = ({ client, onMarkComplete, onSetFollowUp, onReset, onAddComment, onEdit }) => {
    const [showFollowUpOptions, setShowFollowUpOptions] = useState(false);
    const [isFollowUpDue, setIsFollowUpDue] = useState(client.followUpAt ? client.followUpAt <= Date.now() : false);
    const [newComment, setNewComment] = useState('');

    const hasPhone = client.phone && client.phone !== 'N/A';
    const formattedPhone = hasPhone ? `91${client.phone.replace(/\D/g, '')}` : '';

    const handleSetFollowUp = (delayMs: number) => {
        onSetFollowUp(client.id, delayMs);
        setShowFollowUpOptions(false);
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(client.id, newComment.trim());
            setNewComment('');
        }
    };

    const cardBaseClass = "bg-white p-5 rounded-2xl shadow-md flex flex-col justify-between transition-all transform hover:-translate-y-1 duration-300";
    const dueClass = isFollowUpDue ? 'ring-2 ring-amber-500 ring-offset-2' : '';

    const renderCallActions = () => {
        switch(client.callState) {
            case 'completed':
                return (
                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold py-2 px-4 rounded-lg bg-green-50">
                            <IconCheckCircle />
                            Call completed for today
                        </div>
                         <button onClick={() => onReset(client.id)} className="mt-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mx-auto">
                            <IconRefresh /> Reset
                        </button>
                    </div>
                );
            case 'follow-up':
                return (
                    <div className="mt-4 space-y-2">
                        <div className={`p-2 rounded-lg ${isFollowUpDue ? 'bg-amber-100' : 'bg-blue-50'}`}>
                           <FollowUpTimer followUpAt={client.followUpAt!} onEnd={() => setIsFollowUpDue(true)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={`tel:${client.phone}`} className="flex-1 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500"><IconPhone className="w-4 h-4" /> Call Now</a>
                            <button onClick={() => onReset(client.id)} className="font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500"><IconX /></button>
                        </div>
                    </div>
                );
            case 'pending':
            default:
                return (
                    <div className="mt-4">
                        <div className="flex items-center gap-2">
                            <a href={hasPhone ? `tel:${client.phone}` : undefined} aria-disabled={!hasPhone} className={`flex-1 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm ${hasPhone ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}><IconPhone className="w-4 h-4" />Call</a>
                            <a href={hasPhone ? `https://wa.me/${formattedPhone}` : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!hasPhone} className={`flex-1 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm ${hasPhone ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}><IconWhatsApp className="w-4 h-4" />WhatsApp</a>
                        </div>

                        <div className="relative my-4"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-slate-400">Log Call Outcome</span></div></div>
                        
                        {showFollowUpOptions ? (
                           <CustomFollowUpForm
                                onSet={handleSetFollowUp}
                                onCancel={() => setShowFollowUpOptions(false)}
                           />
                        ) : (
                             <div className="flex items-center gap-2">
                                <button onClick={() => onMarkComplete(client.id)} className="flex-1 text-sm font-semibold py-2 px-4 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 flex items-center justify-center gap-1.5"><IconCheck className="w-4 h-4"/>Completed</button>
                                <button onClick={() => setShowFollowUpOptions(true)} className="flex-1 text-sm font-semibold py-2 px-4 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center justify-center gap-1.5"><IconClock className="w-4 h-4 text-amber-600"/>Follow-up</button>
                            </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className={`${cardBaseClass} ${dueClass}`}>
            <div>
                <div className="flex justify-between items-start mb-1">
                    <button onClick={() => onEdit(client)} className="text-left flex-1 group" aria-label={`Edit ${client.name}`}>
                        <h3 className="font-bold text-lg text-slate-800 flex-1 group-hover:text-blue-600 transition-colors">{client.name}</h3>
                    </button>
                </div>
                 <div className="mb-3">
                    <ClientStatusTag status={client.status} />
                </div>
                <div className="space-y-3 text-slate-600">
                    <p className="flex items-center gap-2"><IconMapPin className="text-slate-400" /> <span className="flex-1 font-medium text-blue-600">{client.route}</span></p>
                    <p className="flex items-center gap-2"><IconUser className="w-5 h-5 text-slate-400" /> <span className="flex-1 font-medium">{client.assignedTo || 'Unassigned'}</span></p>
                    <p className="flex items-center gap-2"><IconPhone className="text-slate-400 w-5 h-5"/> {client.phone && client.phone !== 'N/A' ? client.phone : <span className="text-slate-400">Not available</span>}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <IconMessageCircle /> Comments
                </h4>
                <div className="space-y-2 max-h-28 overflow-y-auto pr-2">
                    {client.comments && client.comments.length > 0 ? (
                        client.comments
                            .slice()
                            .sort((a, b) => b.date - a.date)
                            .map((comment, index) => (
                                <div key={index} className="text-xs p-2 bg-slate-50 rounded-md">
                                    <p className="text-slate-700">{comment.text}</p>
                                    <p className="text-right text-slate-400 mt-1">{formatRelativeTime(comment.date)}</p>
                                </div>
                            ))
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">No comments yet.</p>
                    )}
                </div>
                <div className="flex items-start gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="flex-1 w-full text-sm px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-3 py-2 self-stretch bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        aria-label="Add Comment"
                    >
                        Add
                    </button>
                </div>
            </div>

            {renderCallActions()}
        </div>
    );
}

export const CallManagement: React.FC<{
    clients: TraderClient[];
    teamMembers: string[];
    onMarkComplete: (id: string) => void;
    onSetFollowUp: (id: string, delayMs: number) => void;
    onReset: (id: string) => void;
    onAddComment: (id: string, text: string) => void;
    onAddNewParty: () => void;
    onEditParty: (client: TraderClient) => void;
}> = ({ clients, teamMembers, onMarkComplete, onSetFollowUp, onReset, onAddComment, onAddNewParty, onEditParty }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const routes = useMemo(() => ['All', ...Array.from(new Set(clients.map(c => c.route).sort()))], [clients]);
    const [activeRoute, setActiveRoute] = useState(routes[0]);
    const [activeAssignee, setActiveAssignee] = useState('All');

    const filteredClients = useMemo(() => {
        const stateOrder: { [key in CallState]: number } = { 'follow-up': 1, 'pending': 2, 'completed': 3 };
        const statusOrder: { [key in ClientStatus]: number } = { 'High Priority': 1, 'Follow Up': 2, 'Regular': 3 };

        return clients
            .filter(client => {
                const matchesRoute = activeRoute === 'All' || client.route === activeRoute;
                const matchesAssignee = activeAssignee === 'All' || (activeAssignee === 'Unassigned' ? !client.assignedTo : client.assignedTo === activeAssignee);
                const lq = searchQuery.toLowerCase();
                const matchesSearch = searchQuery === '' ||
                    client.name.toLowerCase().includes(lq) ||
                    (client.phone && client.phone.includes(lq));
                return matchesRoute && matchesAssignee && matchesSearch;
            })
            .sort((a, b) => {
                // Primary sort: by call state
                const stateComparison = stateOrder[a.callState] - stateOrder[b.callState];
                if (stateComparison !== 0) return stateComparison;

                // Secondary sort: based on state
                if (a.callState === 'follow-up') {
                    // For follow-ups, earlier reminder times come first
                    return (a.followUpAt || 0) - (b.followUpAt || 0);
                }
                if (a.callState === 'pending') {
                    // For pending, sort by priority status
                    const statusComparison = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
                    if (statusComparison !== 0) return statusComparison;
                }
                
                // Fallback to alphabetical sort by name for consistent ordering
                return a.name.localeCompare(b.name);
            });
    }, [searchQuery, activeRoute, activeAssignee, clients]);

    const getRouteClientCount = (route: string) => {
        if (route === 'All') return clients.length;
        return clients.filter(c => c.route === route).length;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            {/* Main UI for screen view */}
            <div className="space-y-6 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Client List & Call Management</h2>
                    <button 
                        onClick={onAddNewParty}
                        className="flex-shrink-0 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <IconUserPlus /> Add New Party
                    </button>
                </div>
                
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <h3 className="px-2 pb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Select a Beat / Route</h3>
                    <div className="flex items-center gap-3 py-2 -mx-2 px-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {routes.map(route => {
                            const count = getRouteClientCount(route);
                            const isActive = activeRoute === route;
                            return (
                                <button 
                                    key={route} 
                                    onClick={() => setActiveRoute(route)}
                                    className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                                >
                                    <IconRoute className={isActive ? 'text-white' : 'text-blue-500'}/>
                                    <div className="text-left">
                                        <p className="font-bold">{route}</p>
                                        <p className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>{count} clients</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <select
                            value={activeAssignee}
                            onChange={e => setActiveAssignee(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-white pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            aria-label="Filter by assignee"
                        >
                            {['All', ...teamMembers, 'Unassigned'].map(assignee => <option key={assignee} value={assignee}>{assignee}</option>)}
                        </select>
                        <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                    
                    <div className="relative flex-grow">
                        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder={`Search in ${activeRoute}...`} 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        />
                    </div>

                    {activeRoute !== 'All' && (
                        <button
                            onClick={handlePrint}
                            className="flex-shrink-0 bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <IconPrinter /> Print Report
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => <ClientCard key={client.id} client={client} onMarkComplete={onMarkComplete} onSetFollowUp={onSetFollowUp} onReset={onReset} onAddComment={onAddComment} onEdit={onEditParty} />)
                    ) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-slate-700">No Clients Found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content formatted for printing */}
            <div className="hidden print:block printable-report">
                <h2 className="text-2xl font-bold mb-2">Client Report: {activeRoute}</h2>
                <p className="mb-6 text-sm text-slate-600">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-2 text-left w-[10%]">S.No.</th>
                            <th className="p-2 text-left w-[60%]">Party Name</th>
                            <th className="p-2 text-left w-[30%]">Mobile Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((client, index) => (
                            <tr key={client.id} className="border-b">
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{client.name}</td>
                                <td className="p-2">{client.phone || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};