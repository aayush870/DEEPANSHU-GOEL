import React, { useState, useMemo } from 'react';
import { TraderClient, ClientStatus } from '../../types/index';
import { 
    IconUserPlus, IconTag, IconMapPin, IconUser, IconCreditCard, IconBellAlert, IconCalendar, IconArchiveBox, IconPhone, IconWhatsApp, IconChevronDown, IconCheck, IconPencil, IconTrash, IconCheckCircle
} from '../../assets/icons';
import { formatCurrency, getTodayDateString, toTitleCase } from '../../utils/helpers';

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

const PaymentReminderCard: React.FC<{
    client: TraderClient;
    onSetReminder: (clientId: string, date: string) => void;
    onRecordPayment: (clientId: string, amount: number) => void;
    onAssign: (id: string, assignee: string) => void;
    teamMembers: string[];
}> = ({ client, onSetReminder, onRecordPayment, onAssign, teamMembers }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [reminderDate, setReminderDate] = useState(client.paymentReminderDate ? new Date(client.paymentReminderDate).toISOString().split('T')[0] : getTodayDateString());
    const [paymentAmount, setPaymentAmount] = useState('');

    const hasPhone = client.phone && client.phone !== 'N/A';
    const formattedPhone = hasPhone ? `91${client.phone.replace(/\D/g, '')}` : '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isDue = client.paymentReminderDate ? client.paymentReminderDate < today.getTime() + 86400000 : false;
    
    const handleSaveReminder = (e: React.FormEvent) => {
        e.preventDefault();
        onSetReminder(client.id, reminderDate);
        setIsEditing(false);
    }
    
    const handleRecordPayment = () => {
        const amount = parseFloat(paymentAmount);
        if(!amount || amount <= 0) return;
        onRecordPayment(client.id, amount);
        setPaymentAmount('');
        setIsEditing(false);
    }

    const cardClasses = `p-5 rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-300 ${isDue ? 'bg-red-50 ring-2 ring-red-400' : 'bg-white'}`;

    return (
        <div className={cardClasses}>
            <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{toTitleCase(client.name)}</h3>
                    <ClientStatusTag status={client.status} />
                </div>
                <div className="space-y-3 text-slate-600">
                    <p className="flex items-center gap-3"><IconMapPin className="text-slate-400" /> <span className="flex-1 font-medium text-blue-600">{client.route}</span></p>
                    <div className="flex items-center gap-3">
                       <IconUser className="w-5 h-5 text-slate-400" />
                        <div className="relative w-full">
                            <select 
                                value={client.assignedTo || ''} 
                                onChange={(e) => onAssign(client.id, e.target.value)}
                                className="w-full font-medium bg-transparent -ml-1 focus:outline-none focus:ring-0 border-0 appearance-none"
                                aria-label="Assign team member"
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                            </select>
                            <IconChevronDown className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        </div>
                    </div>
                    <p className="flex items-center gap-3 font-semibold text-base"><IconCreditCard className="text-slate-400" /> Outstanding: <span className="text-red-500">{formatCurrency(client.outstandingBalance || 0)}</span></p>
                </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200">
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                             <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Record Payment</label>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder={`Max: ${formatCurrency(client.outstandingBalance || 0)}`}
                                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                                <button type="button" onClick={() => setPaymentAmount(String(client.outstandingBalance || 0))} className="text-xs font-semibold text-blue-600 whitespace-nowrap hover:underline">Full</button>
                             </div>
                              <button onClick={handleRecordPayment} className="w-full mt-2 text-sm font-semibold py-2 px-4 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2">
                                Record Payment
                            </button>
                        </div>
                         
                        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-slate-400">OR</span></div></div>

                        <form onSubmit={handleSaveReminder} className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 mb-1 block">
                                {client.paymentReminderDate ? 'Reschedule Reminder' : 'Set Reminder'}
                            </label>
                            <input 
                                type="date" 
                                value={reminderDate}
                                min={getTodayDateString()}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            <button type="submit" className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save Reminder</button>
                        </form>
                         <button type="button" onClick={() => setIsEditing(false)} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>

                    </div>
                ) : (
                    <div className="space-y-3">
                         {client.paymentReminderDate ? (
                            <div className={`p-2.5 rounded-lg text-center ${isDue ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                                <p className="text-xs font-semibold uppercase">{isDue ? 'Follow-up Due' : 'Reminder Set For'}</p>
                                <p className="font-bold text-sm flex items-center justify-center gap-2 mt-0.5">
                                    <IconCalendar className={isDue ? 'text-red-500' : 'text-blue-500'} />
                                    {new Date(client.paymentReminderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                         ) : null}
                        <button onClick={() => setIsEditing(true)} className="w-full text-sm font-semibold py-3 px-4 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200/50 flex items-center justify-center gap-2 transition-colors">
                            <IconCalendar className="text-blue-600" /> Manage Payment
                        </button>
                        
                         <div className="flex items-center gap-3">
                            <a href={hasPhone ? `tel:${client.phone}` : undefined} aria-disabled={!hasPhone} className={`flex-1 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm ${hasPhone ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}><IconPhone className="w-4 h-4" />Call</a>
                            <a href={hasPhone ? `https://wa.me/${formattedPhone}` : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!hasPhone} className={`flex-1 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 text-sm ${hasPhone ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}><IconWhatsApp className="w-4 h-4" />WhatsApp</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettledClientCard: React.FC<{ client: TraderClient }> = ({ client }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-slate-800">{toTitleCase(client.name)}</h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                    <IconCheck className="w-3 h-3"/> Settled
                </span>
            </div>
            <div className="mt-2 space-y-1.5 text-sm text-slate-500">
                 <p className="flex items-center gap-2"><IconMapPin className="w-4 h-4 text-slate-400" /> <span className="font-medium text-blue-600">{client.route}</span></p>
                 <p className="flex items-center gap-2"><IconUser className="w-4 h-4 text-slate-400" /> <span>{client.assignedTo || 'Unassigned'}</span></p>
            </div>
        </div>
    );
};


export const PendingPayments: React.FC<{
    clients: TraderClient[];
    teamMembers: string[];
    onAssign: (id: string, assignee: string) => void;
    setClients: React.Dispatch<React.SetStateAction<TraderClient[]>>;
    onAddNewParty: () => void;
}> = ({ clients, teamMembers, onAssign, setClients, onAddNewParty }) => {
    const [activeAssignee, setActiveAssignee] = useState('All');
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    const handleSetReminder = (clientId: string, dateString: string) => {
        const date = new Date(dateString);
        // To counteract timezone issues, get time in UTC at midnight for the selected date
        const reminderTimestamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        setClients(prev => prev.map(c => 
            c.id === clientId ? { ...c, paymentReminderDate: reminderTimestamp } : c
        ));
    };

    const handleRecordPayment = (clientId: string, amountPaid: number) => {
        setClients(prev => prev.map(c => {
            if (c.id === clientId) {
                const newBalance = (c.outstandingBalance || 0) - amountPaid;
                return {
                    ...c,
                    outstandingBalance: Math.max(0, newBalance),
                    paymentReminderDate: newBalance > 0 ? c.paymentReminderDate : undefined,
                };
            }
            return c;
        }));
    };

    const { due, upcoming, noReminder, totalOutstanding, totalDueCount, archived } = useMemo(() => {
        const filteredClients = clients.filter(c => activeAssignee === 'All' || (activeAssignee === 'Unassigned' ? !c.assignedTo : c.assignedTo === activeAssignee));

        const clientsWithDues = filteredClients.filter(c => c.outstandingBalance && c.outstandingBalance > 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const due: TraderClient[] = [];
        const upcoming: TraderClient[] = [];
        const noReminder: TraderClient[] = [];
        let totalOutstanding = 0;

        clientsWithDues.forEach(client => {
            totalOutstanding += client.outstandingBalance || 0;
            if (client.paymentReminderDate) {
                if (client.paymentReminderDate <= todayTimestamp) {
                    due.push(client);
                } else {
                    upcoming.push(client);
                }
            } else {
                noReminder.push(client);
            }
        });
        
        due.sort((a, b) => (a.paymentReminderDate || 0) - (b.paymentReminderDate || 0));
        upcoming.sort((a, b) => (a.paymentReminderDate || 0) - (b.paymentReminderDate || 0));
        noReminder.sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0));

        const archived = filteredClients.filter(c => c.outstandingBalance !== undefined && c.outstandingBalance <= 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        return { due, upcoming, noReminder, totalOutstanding, totalDueCount: due.length, archived };
    }, [clients, activeAssignee]);

    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pending Payments</h2>
                    <p className="text-slate-500">Total Outstanding: <span className="font-bold text-red-600">{formatCurrency(totalOutstanding)}</span></p>
                </div>
                <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3">
                    <button 
                        onClick={onAddNewParty}
                        className="flex-shrink-0 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <IconUserPlus /> Add New Party
                    </button>
                    {totalDueCount > 0 &&
                        <div className="flex items-center gap-2 p-3 bg-red-100 rounded-lg text-red-800 font-semibold animate-pulse">
                            <IconBellAlert className="w-6 h-6" />
                            <span>{totalDueCount} client{totalDueCount > 1 ? 's' : ''} require immediate follow-up!</span>
                        </div>
                    }
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <span className="text-sm font-semibold text-slate-500 pr-2">Assigned:</span>
                {['All', ...teamMembers, 'Unassigned'].map(assignee => (
                    <button 
                        key={assignee}
                        onClick={() => setActiveAssignee(assignee)}
                        className={`px-4 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 text-sm ${activeAssignee === assignee ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {assignee}
                    </button>
                ))}
            </div>


            {[
                { title: `Requires Attention (${noReminder.length})`, list: noReminder, icon: <IconCreditCard className="text-amber-600" /> },
                { title: `Due for Follow-up (${due.length})`, list: due, icon: <IconBellAlert className="text-red-600" /> },
                { title: `Upcoming Reminders (${upcoming.length})`, list: upcoming, icon: <IconCalendar className="text-blue-600" /> },
            ].map(({ title, list, icon }) => list.length > 0 && (
                <div key={title}>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">{icon} {title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.map(client => (
                            <PaymentReminderCard 
                                key={client.id} 
                                client={client} 
                                onSetReminder={handleSetReminder}
                                onRecordPayment={handleRecordPayment}
                                onAssign={onAssign}
                                teamMembers={teamMembers}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {due.length === 0 && upcoming.length === 0 && noReminder.length === 0 && (
                 <div className="col-span-full text-center py-16 bg-slate-50 rounded-xl">
                    <IconCheckCircle className="mx-auto" />
                    <h3 className="text-xl font-semibold text-slate-700 mt-4">All Clear!</h3>
                    <p className="text-slate-500 mt-2">There are no outstanding payments for the selected assignee.</p>
                </div>
            )}
            
            {archived.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                    <button onClick={() => setIsArchiveOpen(prev => !prev)} className="w-full flex justify-between items-center text-left py-2">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-3">
                           <IconArchiveBox /> Archived / Settled Clients ({archived.length})
                        </h3>
                        <IconChevronDown className={`transform transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isArchiveOpen && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {archived.map(client => <SettledClientCard key={client.id} client={client} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};