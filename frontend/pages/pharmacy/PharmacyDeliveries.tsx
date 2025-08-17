import React, { useState, useMemo, useCallback } from 'react';
import { Delivery, DeliveryStatus, MedicationStatus } from '../../types/index';
import { initialDeliveries } from '../../assets/data';
import { 
    IconTruck, IconClock, IconSearch, IconCheckCircle
} from '../../assets/icons';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { AddDeliveryForm } from './components/AddDeliveryForm';
import { DeliveryCard } from './components/DeliveryCard';

export const PharmacyDeliveries = () => {
    const [deliveries, setDeliveries] = useLocalStorageState<Delivery[]>('pharmacy_deliveries', initialDeliveries);
    const [searchQuery, setSearchQuery] = useState('');

    const pendingDeliveries = useMemo(() => deliveries.filter(d => d.status === DeliveryStatus.Pending), [deliveries]);
    const completedDeliveries = useMemo(() => deliveries.filter(d => d.status === DeliveryStatus.Completed), [deliveries]);

    const handleAddDelivery = useCallback((newDeliveryData: Omit<Delivery, 'id' | 'status'>) => {
        const newDelivery: Delivery = { ...newDeliveryData, id: Date.now().toString(), status: DeliveryStatus.Pending };
        setDeliveries(prev => [newDelivery, ...prev]);
    }, [setDeliveries]);

    const handleMarkAsCompleted = useCallback((id: string) => setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: DeliveryStatus.Completed } : d)), [setDeliveries]);
    
    const handleReopenDelivery = useCallback((id: string) => {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: DeliveryStatus.Pending } : d));
    }, [setDeliveries]);

    const handleUpdateMedicationStatus = useCallback((deliveryId: string, medicationName: string, newStatus: MedicationStatus) => {
        setDeliveries(prev => prev.map(delivery => {
            if (delivery.id === deliveryId) {
                const updatedMedications = delivery.medications.map(med => {
                    if (med.name === medicationName) {
                        return { ...med, status: newStatus };
                    }
                    return med;
                });
                return { ...delivery, medications: updatedMedications };
            }
            return delivery;
        }));
    }, [setDeliveries]);
    
    const filteredPendingDeliveries = useMemo(() => {
        if (!searchQuery) return pendingDeliveries;
        const lq = searchQuery.toLowerCase();
        return pendingDeliveries.filter(d => d.patientName.toLowerCase().includes(lq) || d.medications.some(m => m.name.toLowerCase().includes(lq)) || d.address.toLowerCase().includes(lq));
    }, [pendingDeliveries, searchQuery]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1"><AddDeliveryForm onAddDelivery={handleAddDelivery} /></div>
            <div className="xl:col-span-2 space-y-12">
                <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3"><IconClock className="text-amber-500" /><h2 className="text-2xl font-bold text-slate-800">Pending Deliveries ({filteredPendingDeliveries.length})</h2></div>
                        <div className="relative"><IconSearch className="absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search deliveries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredPendingDeliveries.length > 0 ? (
                            filteredPendingDeliveries.map(d => <DeliveryCard key={d.id} delivery={d} onMarkAsCompleted={handleMarkAsCompleted} onUpdateMedicationStatus={handleUpdateMedicationStatus} />)
                        ) : (<p className="text-slate-500 md:col-span-2 text-center py-8">{searchQuery ? 'No deliveries match your search.' : 'No pending deliveries.'}</p>)}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-6"><IconCheckCircle /><h2 className="text-2xl font-bold text-slate-800">Completed Deliveries ({completedDeliveries.length})</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {completedDeliveries.length > 0 ? (
                            completedDeliveries.map(d => <DeliveryCard key={d.id} delivery={d} onReopenDelivery={handleReopenDelivery} />)
                         ) : (<p className="text-slate-500 md:col-span-2 text-center py-4">No deliveries have been completed yet.</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};
