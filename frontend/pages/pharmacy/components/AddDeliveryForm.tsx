import React, { useState } from 'react';
import { Delivery, MedicationItem } from '../../../types/index';
import { IconTrash, IconPlus, IconMinus } from '../../../assets/icons';

export const AddDeliveryForm = ({ onAddDelivery }: { onAddDelivery: (delivery: Omit<Delivery, 'id' | 'status'>) => void }) => {
    const [patientName, setPatientName] = useState('');
    const [medications, setMedications] = useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '1' }]);
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');

    const handleMedicationChange = (index: number, field: 'name' | 'quantity', value: string) => {
        const newMedications = [...medications];
        if (field === 'quantity') {
            newMedications[index][field] = value.replace(/[^0-9]/g, '');
        } else {
            newMedications[index][field] = value;
        }
        setMedications(newMedications);
    };
    
    const handleQuantityChange = (index: number, delta: number) => {
        const newMedications = [...medications];
        const currentQuantity = parseInt(newMedications[index].quantity, 10) || 0;
        const newQuantity = Math.max(1, currentQuantity + delta);
        newMedications[index].quantity = newQuantity.toString();
        setMedications(newMedications);
    };

    const addMedicationRow = () => setMedications([...medications, { name: '', quantity: '1' }]);
    const removeMedicationRow = (index: number) => setMedications(medications.filter((_, i) => i !== index));

    const clearForm = () => {
        setPatientName('');
        setMedications([{ name: '', quantity: '1' }]);
        setAddress('');
        setContact('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validMedications: MedicationItem[] = medications
            .map(m => ({ 
                name: m.name, 
                quantity: parseInt(m.quantity, 10) || 1,
                status: 'Pending' as const
            }))
            .filter(m => m.name.trim() !== '');

        if (!patientName || validMedications.length === 0 || !address || !contact) return;
        
        onAddDelivery({ patientName, medications: validMedications, address, contact });
        clearForm();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Delivery</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block" htmlFor="patientName">Patient Name</label>
                    <input id="patientName" type="text" placeholder="e.g., John Doe" value={patientName} onChange={e => setPatientName(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 mb-2 block">Medications</label>
                    <div className="space-y-3">
                        {medications.map((med, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="e.g., Atorvastatin 20mg" value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                                
                                <div className="flex items-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(index, -1)}
                                        disabled={parseInt(med.quantity, 10) <= 1}
                                        className="h-[42px] w-10 flex items-center justify-center bg-slate-200 text-slate-700 rounded-l-lg hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 z-10"
                                        aria-label="Decrease quantity"
                                    >
                                        <IconMinus />
                                    </button>
                                    <input
                                        type="text"
                                        aria-label="Quantity"
                                        value={med.quantity}
                                        onChange={e => handleMedicationChange(index, 'quantity', e.target.value)}
                                        required
                                        className="w-14 h-[42px] text-center bg-white border-y border-slate-200 focus:ring-2 focus:ring-inset focus:ring-green-500 focus:border-green-500 outline-none transition z-0 -mx-px"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(index, 1)}
                                        className="h-[42px] w-10 flex items-center justify-center bg-slate-200 text-slate-700 rounded-r-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 z-10"
                                        aria-label="Increase quantity"
                                    >
                                        <IconPlus />
                                    </button>
                                </div>

                                {medications.length > 1 && (<button type="button" onClick={() => removeMedicationRow(index)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition shrink-0"><IconTrash /></button>)}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addMedicationRow} className="mt-3 text-sm font-semibold text-green-600 hover:text-green-800 transition">+ Add another medication</button>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block" htmlFor="address">Address</label>
                    <input id="address" type="text" placeholder="e.g., 123 Main St, Anytown, USA" value={address} onChange={e => setAddress(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block" htmlFor="contact">Patient Contact</label>
                    <input id="contact" type="text" placeholder="e.g., 555-123-4567" value={contact} onChange={e => setContact(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                    <button type="button" onClick={clearForm} className="w-1/3 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300">Clear</button>
                    <button type="submit" className="w-2/3 bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105">Add Delivery</button>
                </div>
            </form>
        </div>
    );
};
