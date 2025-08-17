import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { TransactionType } from '../../../types';
import { fileToBase64 } from '../../../utils/helpers';
import { IconPaperclip, IconX } from '../../../assets/icons';

export const AddTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (amount: number, notes: string, photos: File[]) => void;
    transactionType: TransactionType;
    partyType: 'Customer' | 'Supplier';
}> = ({ isOpen, onClose, onAddTransaction, transactionType, partyType }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    
    const isCredit = transactionType === TransactionType.Credit;
    
    useEffect(() => {
        if (!isOpen) { // Reset form when modal closes
            setAmount('');
            setNotes('');
            setPhotos([]);
            setPhotoPreviews([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const newPreviews = photos.map(file => URL.createObjectURL(file));
        setPhotoPreviews(newPreviews);

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [photos]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleRemovePhoto = (indexToRemove: number) => {
        setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            onAddTransaction(numAmount, notes, photos);
            onClose();
        }
    };
    
    const modalTitle = isCredit
        ? (partyType === 'Customer' ? 'Add Credit (Udhaar)' : 'Add Purchase')
        : (partyType === 'Customer' ? 'Add Payment (Jama)' : 'Make Payment');

    const notesPlaceholder = isCredit
        ? (partyType === 'Customer' ? "e.g., Crocin, Dolo 650" : "e.g., Monthly stock order")
        : (partyType === 'Customer' ? "e.g., Paid via Cash" : "e.g., Bank Transfer");
        
    const buttonText = isCredit
        ? (partyType === 'Customer' ? 'Add Credit' : 'Add Purchase')
        : (partyType === 'Customer' ? 'Add Payment' : 'Make Payment');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="text-sm font-semibold text-slate-600 mb-1 block">Amount (₹)</label>
                    <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required min="0.01" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                    <label htmlFor="notes" className="text-sm font-semibold text-slate-600 mb-1 block">Notes (Optional)</label>
                    <input id="notes" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder={notesPlaceholder} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                 <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">Attachments</label>
                    <label htmlFor="photo-upload" className="cursor-pointer w-full bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 border-2 border-dashed border-slate-300">
                        <IconPaperclip />
                        <span>Upload Photos</span>
                    </label>
                    <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    {photoPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {photoPreviews.map((previewUrl, index) => (
                                <div key={index} className="relative">
                                    <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemovePhoto(index)} 
                                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                                        aria-label="Remove photo"
                                    >
                                        <IconX className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="pt-2">
                    <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 ${isCredit ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500'}`}>
                        {buttonText}
                    </button>
                </div>
            </form>
        </Modal>
    );
};