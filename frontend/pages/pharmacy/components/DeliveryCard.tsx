import React from 'react';
import { Delivery, DeliveryStatus, MedicationStatus } from '../../../types/index';
import { 
    IconUser, IconMedication, IconMapPin, IconPhone, IconWhatsApp, IconCheck, IconRefresh
} from '../../../assets/icons';

export const DeliveryCard = ({ 
    delivery, 
    onMarkAsCompleted,
    onReopenDelivery,
    onUpdateMedicationStatus,
}: { 
    delivery: Delivery, 
    onMarkAsCompleted?: (id: string) => void,
    onReopenDelivery?: (id: string) => void,
    onUpdateMedicationStatus?: (deliveryId: string, medicationName: string, newStatus: MedicationStatus) => void,
}) => {
    const isPending = delivery.status === DeliveryStatus.Pending;
    const hasContact = delivery.contact && delivery.contact.trim() !== '';
    const formattedWhatsAppNumber = hasContact ? `91${delivery.contact.replace(/\D/g, '')}` : '';
    
    const medicationStatusOptions: MedicationStatus[] = ['Pending', 'Order Placed', 'Arriving Today', 'In Stock'];
    const statusColorMap: Record<MedicationStatus, string> = {
        'Pending': 'bg-slate-200 text-slate-700',
        'Order Placed': 'bg-blue-100 text-blue-800',
        'Arriving Today': 'bg-amber-100 text-amber-800',
        'In Stock': 'bg-emerald-100 text-emerald-800',
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col justify-between transition-transform transform hover:-translate-y-1">
            <div>
                {/* Patient Info */}
                <div className="flex items-center gap-3 mb-5">
                    <IconUser className="text-slate-500" />
                    <h3 className="font-bold text-lg text-slate-800">{delivery.patientName}</h3>
                </div>

                <div className="space-y-4 text-slate-700">
                    {/* Medications List */}
                    <div className="flex items-start gap-3">
                        <IconMedication className="text-slate-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                            {delivery.medications.map((med, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1 mb-2 sm:mb-0">
                                        <p className="font-medium">{med.name}</p>
                                        {isPending && onUpdateMedicationStatus ? (
                                             <div className="relative inline-block text-left mt-1.5">
                                                 <select
                                                     value={med.status}
                                                     onChange={(e) => onUpdateMedicationStatus(delivery.id, med.name, e.target.value as MedicationStatus)}
                                                     className={`text-xs font-semibold py-1 pl-2 pr-7 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 ${statusColorMap[med.status]}`}
                                                 >
                                                     {medicationStatusOptions.map(status => (
                                                         <option key={status} value={status}>{status}</option>
                                                     ))}
                                                 </select>
                                                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <svg className={`w-3 h-3 ${statusColorMap[med.status].split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                  </span>
                                             </div>
                                        ) : (
                                            <span className={`text-xs font-semibold py-1 px-2.5 rounded-md inline-block mt-1.5 ${statusColorMap[med.status]}`}>
                                                {med.status}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-slate-500 font-medium text-sm self-start sm:self-center">Qty: {med.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address */}
                    <p className="flex items-start gap-3"><IconMapPin className="text-slate-400 flex-shrink-0" /> <span className="flex-1">{delivery.address}</span></p>
                    
                    {/* Contact */}
                    <div className="flex items-center gap-3 pt-1">
                        <IconPhone className="text-slate-400 flex-shrink-0" />
                        <span className="font-medium">{delivery.contact}</span>
                        {hasContact && (
                             <a
                                href={`https://wa.me/${formattedWhatsAppNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 text-xs bg-green-100 text-green-700 hover:bg-green-200 focus:ring-emerald-500"
                            >
                                <IconWhatsApp className="w-4 h-4" />
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100">
                {isPending && onMarkAsCompleted && (
                    <button onClick={() => onMarkAsCompleted(delivery.id)} className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-300 text-base">
                        <IconCheck className="w-5 h-5"/> Mark as Completed
                    </button>
                )}
                {!isPending && onReopenDelivery && (
                    <button onClick={() => onReopenDelivery(delivery.id)} className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 text-base">
                        <IconRefresh className="w-5 h-5"/> Re-open Delivery
                    </button>
                )}
            </div>
        </div>
    );
};
