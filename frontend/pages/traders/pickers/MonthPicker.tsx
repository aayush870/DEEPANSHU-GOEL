import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../../assets/icons';

export const MonthPicker: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    value: string; // YYYY-MM
    onSelect: (value: string) => void;
}> = ({ isOpen, onClose, value, onSelect }) => {
    const [currentYear, currentMonth] = useMemo(() => {
        const [y, m] = value.split('-').map(Number);
        return [y, m - 1];
    }, [value]);

    const [viewYear, setViewYear] = useState(currentYear);

    useEffect(() => {
        if (isOpen) {
            setViewYear(currentYear);
        }
    }, [isOpen, currentYear]);

    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => 
        new Date(0, i).toLocaleString('default', { month: 'short' })
    ), []);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setViewYear(y => y - 1)} className="p-2 rounded-full hover:bg-slate-100"><IconChevronLeft /></button>
                    <span className="font-bold text-lg text-slate-800">{viewYear}</span>
                    <button onClick={() => setViewYear(y => y + 1)} className="p-2 rounded-full hover:bg-slate-100"><IconChevronRight /></button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {months.map((month, index) => {
                        const isSelected = viewYear === currentYear && index === currentMonth;
                        const isTodayMonth = viewYear === new Date().getFullYear() && index === new Date().getMonth();

                        let buttonClass = 'py-2.5 rounded-lg font-semibold text-sm transition-colors ';
                        if (isSelected) {
                            buttonClass += 'bg-blue-600 text-white shadow-md';
                        } else if (isTodayMonth) {
                            buttonClass += 'bg-blue-100 text-blue-700 hover:bg-blue-200';
                        } else {
                            buttonClass += 'hover:bg-slate-100 text-slate-700';
                        }

                        return (
                            <button
                                key={month}
                                onClick={() => onSelect(`${viewYear}-${String(index + 1).padStart(2, '0')}`)}
                                className={buttonClass}
                            >
                                {month}
                            </button>
                        );
                    })}
                </div>
                 <div className="mt-4 pt-4 border-t border-slate-200">
                     <button 
                        onClick={() => {
                            const today = new Date();
                            onSelect(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
                        }}
                        className="w-full text-center font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 py-2 rounded-lg transition-colors"
                    >
                        This Month
                    </button>
                </div>
            </div>
        </div>
    );
};