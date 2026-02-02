
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { IndianRupee, Wallet, ArrowUpCircle, ArrowDownCircle, HardHat, AlertCircle, Banknote, ShieldCheck } from 'lucide-react';
import { Income, Expense, LabourProfile, Attendance, LabourPayment, AppSettings } from '../types';

interface DashboardViewProps {
    incomes: Income[];
    expenses: Expense[];
    labours: LabourProfile[];
    attendance: Attendance[];
    payments: LabourPayment[];
    t: any;
    settings: AppSettings;
}

const DashboardView: React.FC<DashboardViewProps> = ({ incomes, expenses, labours, attendance, payments, t, settings }) => {
    const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
    
    const labourStats = useMemo(() => {
        let earningsTotal = 0;
        let paymentsTotal = 0;

        labours.forEach(l => {
            const att = attendance.filter(a => a.labourId === l.id);
            const totalDays = att.reduce((acc, curr) => acc + (curr.status === 'Present' ? 1 : curr.status === 'Half-Day' ? 0.5 : 0), 0);
            const totalOT = att.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
            const earned = (totalDays * l.dailyWage) + (totalOT * (l.dailyWage / 8));
            
            const paid = payments.filter(p => p.labourId === l.id).reduce((acc, curr) => acc + curr.amount, 0);
            
            earningsTotal += earned;
            paymentsTotal += paid;
        });

        return { earningsTotal, paymentsTotal, outstanding: earningsTotal - paymentsTotal };
    }, [labours, attendance, payments]);

    const totalExpense = useMemo(() => {
        const directExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        return directExpenses + labourStats.paymentsTotal;
    }, [expenses, labourStats.paymentsTotal]);

    const netBalance = totalIncome - totalExpense;

    const partnerStats = useMemo(() => {
        const mujahir = incomes.filter(i => i.paidBy === 'Master Mujahir').reduce((sum, i) => sum + i.amount, 0);
        const salik = incomes.filter(i => i.paidBy === 'Dr. Salik').reduce((sum, i) => sum + i.amount, 0);
        return { mujahir, salik };
    }, [incomes]);

    const chartData = [
        { name: t.income, amount: totalIncome, fill: '#10b981' },
        { name: t.expense, amount: totalExpense, fill: '#ef4444' },
        { name: t.availableBalance, amount: netBalance, fill: '#1e3a8a' }
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Main Balance Card */}
            <div className="primary-blue rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">{t.netBalance}</p>
                    <h2 className="text-3xl font-bold tracking-tight">₹ {netBalance.toLocaleString()}</h2>
                    <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
                        <div className="bg-white/10 px-2 py-1 rounded-lg">
                            <span className="opacity-60 block text-[8px]">In Pocket</span>
                            <span>₹ {netBalance.toLocaleString()}</span>
                        </div>
                        <div className="bg-amber-500/20 px-2 py-1 rounded-lg text-amber-200 border border-amber-500/30">
                            <span className="opacity-60 block text-[8px]">Unpaid Labour</span>
                            <span>₹ {labourStats.outstanding.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    title={t.totalIncome} 
                    value={totalIncome} 
                    icon={<ArrowUpCircle className="text-emerald-500" />} 
                    bgColor="bg-white"
                    textColor="text-emerald-600"
                />
                <StatCard 
                    title={t.totalExpense} 
                    value={totalExpense} 
                    icon={<ArrowDownCircle className="text-rose-500" />} 
                    bgColor="bg-white"
                    textColor="text-rose-600"
                />
                <StatCard 
                    title={t.availableBalance} 
                    value={netBalance} 
                    icon={<ShieldCheck className="text-primary-blue" />} 
                    bgColor="bg-white"
                    textColor="text-blue-900"
                />
                <StatCard 
                    title="Labour Paid" 
                    value={labourStats.paymentsTotal} 
                    icon={<Banknote className="text-blue-500" />} 
                    bgColor="bg-white"
                    textColor="text-blue-600"
                />
            </div>

            {/* Partner Tracking */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">{t.partnerShare}</h3>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Share</div>
                </div>
                
                <div className="space-y-5">
                    <PartnerProgress 
                        name="Master Mujahir" 
                        amount={partnerStats.mujahir} 
                        total={partnerStats.mujahir + partnerStats.salik} 
                        color="bg-blue-900" 
                    />
                    <PartnerProgress 
                        name="Dr. Salik" 
                        amount={partnerStats.salik} 
                        total={partnerStats.mujahir + partnerStats.salik} 
                        color="bg-blue-500" 
                    />
                </div>
            </div>

            {/* Financial Overview Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm mb-6 tracking-tight">Overview</h3>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                            />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bgColor, textColor }: any) => (
    <div className={`${bgColor} p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start">
            <span className="p-1.5 bg-slate-50 rounded-lg">{icon}</span>
        </div>
        <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
            <p className={`text-base font-bold ${textColor}`}>₹ {value.toLocaleString()}</p>
        </div>
    </div>
);

const PartnerProgress = ({ name, amount, total, color }: any) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-700">{name}</span>
                <span className="text-slate-800">₹ {amount.toLocaleString()} ({Math.round(percentage)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                    className={`${color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default DashboardView;
