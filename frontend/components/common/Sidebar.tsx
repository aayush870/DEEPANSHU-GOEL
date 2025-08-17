import React from 'react';
import { 
    IconPharmacyLogo, IconTruck, IconBookOpen, IconAyushman, IconPhone, 
    IconCreditCard, IconClipboardList, IconUsers, IconReceipt, IconUsers as ClientIcon, IconClipboardList as BoardIcon
} from '../../assets/icons';
import type { ActivePage } from '../../pages/App';

interface SidebarProps {
    activePage: ActivePage;
    setActivePage: (page: ActivePage) => void;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    activeClass: string;
}> = ({ icon, label, isActive, onClick, activeClass }) => {
    const baseClasses = "flex items-center w-full text-left p-3 rounded-lg transition-colors duration-200 text-sm";
    const inactiveClasses = "text-slate-300 hover:bg-slate-700/50 hover:text-white";

    return (
        <li>
            <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClass : inactiveClasses}`}>
                <span className="w-6 h-6 mr-3">{icon}</span>
                <span>{label}</span>
            </button>
        </li>
    );
};

const NavGroup: React.FC<{ title: string; children: React.ReactNode; isActive?: boolean; color?: string; }> = ({ title, children, isActive, color = 'text-slate-400' }) => {
    const activeClass = isActive ? color : 'text-slate-400';
    return (
        <div>
            <h3 className={`px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeClass}`}>{title}</h3>
            <ul className="space-y-1">
                {children}
            </ul>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    const pharmacyLinks = [
        { id: 'deliveries', label: 'Deliveries', icon: <IconTruck /> },
        { id: 'khata', label: 'Khata Book', icon: <IconBookOpen /> },
    ];
    
    const ayushmanLinks = [
        { id: 'ayushman_clients', label: 'Clients', icon: <ClientIcon className="w-5 h-5"/> },
        { id: 'ayushman_tasks', label: 'Task Board', icon: <BoardIcon className="w-5 h-5"/> },
    ];

    const tradersLinks = [
        { id: 'calls', label: 'Call Management', icon: <IconPhone className="w-5 h-5"/> },
        { id: 'payments', label: 'Pending Payments', icon: <IconCreditCard /> },
        { id: 'todos', label: 'To-Do List', icon: <IconClipboardList /> },
        { id: 'staff', label: 'Staff / Attendance', icon: <IconUsers /> },
        { id: 'expenses', label: 'Expense Tracker', icon: <IconReceipt /> },
    ];
    
    const getActiveSection = (page: ActivePage): 'pharmacy' | 'ayushman' | 'traders' | 'none' => {
        if ((pharmacyLinks as {id: string}[]).some(l => l.id === page)) return 'pharmacy';
        if ((ayushmanLinks as {id: string}[]).some(l => l.id === page)) return 'ayushman';
        if ((tradersLinks as {id: string}[]).some(l => l.id === page)) return 'traders';
        return 'none';
    };

    const activeSection = getActiveSection(activePage);

    const sectionThemeClasses = {
        pharmacy: 'bg-emerald-600 text-white font-semibold shadow-inner',
        ayushman: 'bg-purple-600 text-white font-semibold shadow-inner',
        traders: 'bg-blue-600 text-white font-semibold shadow-inner',
    };
    
    const sectionHighlightColors = {
        pharmacy: 'text-emerald-400',
        ayushman: 'text-purple-400',
        traders: 'text-blue-400',
    };


    return (
        <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 min-h-screen print:hidden">
            <div className="flex items-center justify-center h-20 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <IconPharmacyLogo />
                    <h1 className="text-xl font-bold text-slate-100">Shri Kripa</h1>
                </div>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                <NavGroup title="Pharmacy" isActive={activeSection === 'pharmacy'} color={sectionHighlightColors.pharmacy}>
                     {pharmacyLinks.map(link => (
                        <NavLink
                            key={link.id}
                            icon={link.icon}
                            label={link.label}
                            isActive={activePage === link.id}
                            onClick={() => setActivePage(link.id as ActivePage)}
                            activeClass={sectionThemeClasses.pharmacy}
                        />
                    ))}
                </NavGroup>

                <NavGroup title="Ayushman" isActive={activeSection === 'ayushman'} color={sectionHighlightColors.ayushman}>
                    {ayushmanLinks.map(link => (
                        <NavLink
                            key={link.id}
                            icon={link.icon}
                            label={link.label}
                            isActive={activePage === link.id}
                            onClick={() => setActivePage(link.id as ActivePage)}
                            activeClass={sectionThemeClasses.ayushman}
                        />
                    ))}
                </NavGroup>

                <NavGroup title="Traders" isActive={activeSection === 'traders'} color={sectionHighlightColors.traders}>
                    {tradersLinks.map(link => (
                        <NavLink
                            key={link.id}
                            icon={link.icon}
                            label={link.label}
                            isActive={activePage === link.id}
                            onClick={() => setActivePage(link.id as ActivePage)}
                            activeClass={sectionThemeClasses.traders}
                        />
                    ))}
                </NavGroup>
            </nav>
        </aside>
    );
};