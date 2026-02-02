
import React, { useState } from 'react';
import { Plus, X, ArrowUpRight, Search, Pencil, Trash2 } from 'lucide-react';
import { Income, IncomeSource, Partner, PaymentMode } from '../types';

interface IncomeViewProps {
    incomes: Income[];
    onAdd: (income: Income) => void;
    onUpdate: (income: Income) => void;
    onDelete: (id: string) => void;
    t: any;
}

const IncomeView: React.FC<IncomeViewProps> = ({ incomes, onAdd, onUpdate, onDelete, t }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        amount: '',
        source: 'Investment' as IncomeSource,
        paidBy: 'Master Mujahir' as Partner,
        mode: 'Cash' as PaymentMode,
        remarks: '',
        date: new Date().toISOString().split('T')[0]
    });

    const openAdd = () => {
        setEditingId(null);
        setFormData({ amount: '', source: 'Investment', paidBy: 'Master Mujahir', mode: 'Cash', remarks: '', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openEdit = (income: Income) => {
        setEditingId(income.id);
        setFormData({
            amount: income.amount.toString(),
            source: income.source,
            paidBy: income.paidBy,
            mode: income.mode,
            remarks: income.remarks,
            date: income.date
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const incomeData: Income = {
            id: editingId || Date.now().toString(),
            amount: parseFloat(formData.amount),
            source: formData.source,
            paidBy: formData.paidBy,
            mode: formData.mode,
            remarks: formData.remarks,
            date: formData.date,
            synced: true
        };

        if (editingId) onUpdate(incomeData);
        else onAdd(incomeData);

        setIsModalOpen(false);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm(t.confirmDelete)) {
            onDelete(id);
        }
    };

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-slate-800">{t.income} (पैसे आए)</h2>
                <button 
                    onClick={openAdd}
                    className="primary-blue text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {incomes.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                        No transactions found
                    </div>
                ) : (
                    incomes.map(income => (
                        <div key={income.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">₹ {income.amount.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400">{income.paidBy} • {income.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 uppercase">{income.source}</span>
                                    <p className="text-[10px] text-slate-400 mt-1">{income.mode}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(income)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Pencil size={14}/></button>
                                    <button onClick={(e) => handleDelete(e, income.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Entry' : t.addIncome}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t.amount}</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter amount"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{t.date}</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">{t.mode}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                                        value={formData.mode}
                                        onChange={e => setFormData({...formData, mode: e.target.value as PaymentMode})}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Check">Check</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t.paidBy}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Master Mujahir', 'Dr. Salik'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({...formData, paidBy: p as Partner})}
                                            className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                                                formData.paidBy === p ? 'primary-blue text-white' : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{t.source}</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                                    value={formData.source}
                                    onChange={e => setFormData({...formData, source: e.target.value as IncomeSource})}
                                >
                                    <option value="Investment">Investment (निवेश)</option>
                                    <option value="Loan">Loan (कर्ज)</option>
                                    <option value="Donation">Donation (दान)</option>
                                    <option value="Other">Other (अन्य)</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full py-4 primary-blue text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all">
                                {t.save}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeView;
