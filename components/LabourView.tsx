
import React, { useState, useMemo } from 'react';
import { Users, Plus, X, Calendar, Wallet, UserPlus, Pencil, Trash2, CheckCheck, Clock, History } from 'lucide-react';
import { LabourProfile, Attendance, LabourPayment, AttendanceStatus, PaymentMode } from '../types';

interface LabourViewProps {
    labours: LabourProfile[];
    attendance: Attendance[];
    payments: LabourPayment[];
    onAddLabour: (l: LabourProfile) => void;
    onUpdateLabour: (l: LabourProfile) => void;
    onDeleteLabour: (id: string) => void;
    onAddAttendance: (a: Attendance) => void;
    onUpdateAttendance: (a: Attendance) => void;
    onDeleteAttendance: (id: string) => void;
    onAddPayment: (p: LabourPayment) => void;
    onUpdatePayment: (p: LabourPayment) => void;
    onDeletePayment: (id: string) => void;
    t: any;
}

const WORK_TYPES = [
    { id: 'Mistry', icon: '🏗️', name: 'मिस्त्री' },
    { id: 'Majdoor', icon: '👷', name: 'मजदूर' },
    { id: 'Plumber', icon: '🔧', name: 'प्लंबर' },
    { id: 'Electrician', icon: '⚡', name: 'इलेक्ट्रिशियन' },
    { id: 'Painter', icon: '🖌️', name: 'पेंटर' },
    { id: 'Carpenter', icon: '🪚', name: 'बढ़ई' }
];

const LabourView: React.FC<LabourViewProps> = ({ 
    labours, attendance, payments, 
    onAddLabour, onUpdateLabour, onDeleteLabour, 
    onAddAttendance, onUpdateAttendance, onDeleteAttendance, 
    onAddPayment, onUpdatePayment, onDeletePayment, 
    t 
}) => {
    const [view, setView] = useState<'profiles' | 'attendance' | 'payments'>('profiles');
    const [isAddingLabour, setIsAddingLabour] = useState(false);
    const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null);
    const [isRecordingAttendance, setIsRecordingAttendance] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    
    const [labourForm, setLabourForm] = useState({ name: '', mobile: '', workType: 'Mistry', dailyWage: '' });
    const [attForm, setAttForm] = useState({ date: new Date().toISOString().split('T')[0], status: 'Present' as AttendanceStatus, overtime: '0' });
    const [payForm, setPayForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], type: 'Full Payment' as any, mode: 'Cash' as PaymentMode });

    const labourStats = useMemo(() => {
        return labours.map(l => {
            const att = attendance.filter(a => String(a.labourId) === String(l.id));
            const totalDays = att.reduce((acc, curr) => acc + (curr.status === 'Present' ? 1 : curr.status === 'Half-Day' ? 0.5 : 0), 0);
            const totalOT = att.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
            const earnings = (totalDays * l.dailyWage) + (totalOT * (l.dailyWage / 8));
            const totalPaid = payments.filter(p => String(p.labourId) === String(l.id)).reduce((acc, curr) => acc + curr.amount, 0);
            return { ...l, totalDays, totalOT, earnings, totalPaid, balance: earnings - totalPaid };
        });
    }, [labours, attendance, payments]);

    const handleBulkAttendance = () => {
        if (!window.confirm(t.markAllPresent + "?")) return;
        const today = new Date().toISOString().split('T')[0];
        labours.forEach(l => {
            onAddAttendance({
                id: Date.now().toString() + l.id,
                labourId: l.id,
                date: today,
                status: 'Present',
                overtimeHours: 0
            });
        });
        alert("Done!");
    };

    const sortedAttendance = useMemo(() => {
        return [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance]);

    const sortedPayments = useMemo(() => {
        return [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments]);

    const getWorkerName = (id: string) => labours.find(l => String(l.id) === String(id))?.name || 'Unknown';

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex bg-slate-200/50 p-1 rounded-2xl sticky top-16 z-40 backdrop-blur-md">
                {(['profiles', 'attendance', 'payments'] as const).map(v => (
                    <button 
                        key={v}
                        onClick={() => setView(v)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
                            view === v ? 'bg-white text-primary-blue shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        {t[v] || v.toUpperCase()}
                    </button>
                ))}
            </div>

            {view === 'profiles' && (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{t.labour}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleBulkAttendance}
                                className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                            >
                                <CheckCheck size={20} />
                                <span className="text-[10px] font-bold uppercase hidden sm:block">{t.markAllPresent}</span>
                            </button>
                            <button 
                                onClick={() => setIsAddingLabour(true)}
                                className="primary-blue text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-all"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {labourStats.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                                <Users size={40} className="mx-auto mb-2 opacity-20" />
                                <p className="font-bold text-sm">{t.noRecords}</p>
                            </div>
                        ) : (
                            labourStats.map(l => (
                                <div key={l.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 primary-blue rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner uppercase">
                                                {l.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base">{l.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                        {t[l.workType] || l.workType}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400">₹{l.dailyWage}/day</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-1">{t.balanceDue}</p>
                                            <p className="text-lg font-black text-slate-900 leading-none">₹ {l.balance.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button 
                                            onClick={() => { setSelectedLabour(l); setIsRecordingAttendance(true); }}
                                            className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-2xl text-[10px] font-bold border border-slate-100 active:scale-95 transition-all"
                                        >
                                            <Calendar size={14} /> {t.attendance.toUpperCase()}
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedLabour(l); setIsPaying(true); }}
                                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
                                        >
                                            <Wallet size={14} /> {t.payments.toUpperCase()}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {view === 'attendance' && (
                <div className="space-y-3">
                    {sortedAttendance.map(a => (
                        <div key={a.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-slate-400" />
                                <div>
                                    <p className="font-bold text-slate-800">{getWorkerName(a.labourId)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{a.date}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${a.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {a.status}
                                </span>
                                <button onClick={() => onDeleteAttendance(a.id)} className="text-rose-400 p-1"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'payments' && (
                <div className="space-y-3">
                    {sortedPayments.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <History size={18} className="text-blue-400" />
                                <div>
                                    <p className="font-bold text-slate-800">₹ {p.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{getWorkerName(p.labourId)} • {p.date}</p>
                                </div>
                            </div>
                            <button onClick={() => onDeletePayment(p.id)} className="text-rose-400 p-1"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            )}

            {isAddingLabour && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.addLabour}</h3>
                            <button onClick={() => setIsAddingLabour(false)} className="bg-slate-100 p-2 rounded-full"><X size={24} /></button>
                        </div>
                        <form className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            onAddLabour({ id: Date.now().toString(), name: labourForm.name, mobile: labourForm.mobile, workType: labourForm.workType, dailyWage: parseFloat(labourForm.dailyWage) });
                            setIsAddingLabour(false);
                            setLabourForm({name:'', mobile:'', workType:'Mistry', dailyWage:''});
                        }}>
                            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Name" required value={labourForm.name} onChange={e => setLabourForm({...labourForm, name: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={labourForm.workType} onChange={e => setLabourForm({...labourForm, workType: e.target.value})}>
                                    {WORK_TYPES.map(w => <option key={w.id} value={w.id}>{t[w.id] || w.name}</option>)}
                                </select>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" type="number" placeholder="Daily Wage" required value={labourForm.dailyWage} onChange={e => setLabourForm({...labourForm, dailyWage: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest">{t.save}</button>
                        </form>
                    </div>
                </div>
            )}

            {isRecordingAttendance && selectedLabour && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">{selectedLabour.name} - {t.attendance}</h3>
                            <button onClick={() => setIsRecordingAttendance(false)} className="bg-slate-100 p-2 rounded-full"><X size={20} /></button>
                        </div>
                        <form className="space-y-5" onSubmit={e => {
                            e.preventDefault();
                            onAddAttendance({ id: Date.now().toString(), labourId: selectedLabour.id, date: attForm.date, status: attForm.status, overtimeHours: parseFloat(attForm.overtime) });
                            setIsRecordingAttendance(false);
                        }}>
                            <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={attForm.date} onChange={e => setAttForm({...attForm, date: e.target.value})} />
                            <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={attForm.status} onChange={e => setAttForm({...attForm, status: e.target.value as AttendanceStatus})}>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Half-Day">Half-Day</option>
                            </select>
                            <input type="number" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Overtime Hours" value={attForm.overtime} onChange={e => setAttForm({...attForm, overtime: e.target.value})} />
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase">{t.save}</button>
                        </form>
                    </div>
                </div>
            )}

            {isPaying && selectedLabour && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">{selectedLabour.name} - {t.payments}</h3>
                            <button onClick={() => setIsPaying(false)} className="bg-slate-100 p-2 rounded-full"><X size={20} /></button>
                        </div>
                        <form className="space-y-5" onSubmit={e => {
                            e.preventDefault();
                            onAddPayment({ id: Date.now().toString(), labourId: selectedLabour.id, date: payForm.date, amount: parseFloat(payForm.amount), type: payForm.type, mode: payForm.mode });
                            setIsPaying(false);
                        }}>
                            <div className="text-center py-4 bg-slate-50 rounded-2xl">
                                <span className="text-xs font-bold text-slate-400 uppercase">Amount to Pay</span>
                                <input type="number" required autoFocus className="bg-transparent text-3xl font-black text-blue-600 outline-none w-full text-center" placeholder="0.00" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
                            </div>
                            <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} />
                            <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value as PaymentMode})}>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank">Bank Transfer</option>
                            </select>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase">{t.save}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabourView;
