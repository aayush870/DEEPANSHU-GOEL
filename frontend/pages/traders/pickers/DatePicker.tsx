import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../../assets/icons';

export const DatePicker: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    allowFutureDates?: boolean;
}> = ({ isOpen, onClose, selectedDate, onDateSelect, allowFutureDates = false }) => {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const parseDate = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const toYYYYMMDD = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [viewDate, setViewDate] = useState(parseDate(selectedDate));
    
    useEffect(() => {
        if(isOpen) {
            setViewDate(parseDate(selectedDate));
        }
    }, [isOpen, selectedDate]);


    const handleMonthChange = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    };

    const handleYearChange = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Pad start with previous month's days
        const prevMonthDays = new Date(year, month, 0).getDate();
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0 (Mon) - 6 (Sun)
        for (let i = 0; i < startDay; i++) {
            days.push({ day: prevMonthDays - startDay + i + 1, isCurrentMonth: false });
        }
        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        // Pad end with next month's days
        const remainingCells = 42 - days.length; // 6 weeks grid
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }
        return days;
    }, [viewDate]);

    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' })), []);
    const years = useMemo(() => Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i), [today]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm p-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-slate-100"><IconChevronLeft /></button>
                    <div className="flex items-center gap-2">
                        <select value={viewDate.getMonth()} onChange={(e) => handleMonthChange(Number(e.target.value))} className="font-bold text-slate-800 bg-slate-100 border-transparent rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-500">
                             {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                         <select value={viewDate.getFullYear()} onChange={(e) => handleYearChange(Number(e.target.value))} className="font-bold text-slate-800 bg-slate-100 border-transparent rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-500">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-slate-100"><IconChevronRight /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 font-semibold mb-2">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d, i) => {
                        const isSelected = d.isCurrentMonth && d.date && toYYYYMMDD(d.date) === selectedDate;
                        const isToday = d.isCurrentMonth && d.date && d.date.getTime() === today.getTime();
                        const isDisabled = !allowFutureDates && d.isCurrentMonth && d.date && d.date > today;

                        const baseClasses = 'w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm transition-colors';
                        let dayClasses = '';

                        if (d.isCurrentMonth) {
                            if (isDisabled) {
                                dayClasses = 'text-slate-300 cursor-not-allowed';
                            } else if (isSelected) {
                                dayClasses = 'bg-blue-600 text-white font-bold';
                            } else if (isToday) {
                                dayClasses = 'text-blue-600 font-bold border-2 border-blue-600';
                            } else {
                                dayClasses = 'text-slate-700 hover:bg-slate-100';
                            }
                            return (
                                <button key={i} disabled={isDisabled} onClick={() => d.date && onDateSelect(toYYYYMMDD(d.date))} className={`${baseClasses} ${dayClasses}`}>
                                    {d.day}
                                </button>
                            );
                        } else {
                            return <div key={i} className={`${baseClasses} text-slate-300`}>{d.day}</div>;
                        }
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                     <button 
                        onClick={() => onDateSelect(toYYYYMMDD(today))}
                        className="w-full text-center font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 py-2 rounded-lg transition-colors"
                    >Today</button>
                </div>
            </div>
        </div>
    );
};