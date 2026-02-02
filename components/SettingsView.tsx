
import React, { useRef, useState, useEffect } from 'react';
import { AppSettings, Income, Expense, LabourProfile, Attendance, LabourPayment, Vendor } from '../types';
import { Languages, Trash2, Smartphone, Download, Share2, FileJson, Cloud, Check, Loader2, LogOut, RefreshCw, ToggleLeft, ToggleRight, FileSpreadsheet, Apple, Copy, ClipboardCheck, Table, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
    settings: AppSettings;
    onUpdate: (s: AppSettings) => void;
    onReset: () => void;
    onImport: (allData: any) => void;
    t: any;
    allData: {
        incomes: Income[];
        expenses: Expense[];
        labours: LabourProfile[];
        attendance: Attendance[];
        payments: LabourPayment[];
        vendors: Vendor[];
    };
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onReset, onImport, t, allData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isSyncingSheets, setIsSyncingSheets] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        setIsIOS(ios);
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        });
    }, []);

    const handleInstallApp = () => {
        if (isIOS) alert(t.iosInstallMsg);
        else if (installPrompt) installPrompt.prompt();
        else alert("Browser Menu (3 dots) -> Add to Home Screen");
    };

    const handleDownloadJSON = () => {
        const fullData = { ...allData, settings, version: '1.2' };
        const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Shiksha_Setu_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleCopyToClipboard = () => {
        const fullData = { ...allData, settings };
        navigator.clipboard.writeText(JSON.stringify(fullData)).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            alert("डेटा कॉपी हो गया! इसे सुरक्षित जगह पर पेस्ट कर लें।");
        });
    };

    const handleSyncToGoogleSheets = async () => {
        if (!settings.googleSheetUrl) {
            alert("कृपया पहले Apps Script URL डालें। गाइड के लिए (?) बटन दबाएं।");
            return;
        }

        setIsSyncingSheets(true);
        try {
            const payload = {
                sheetName: settings.schoolName,
                timestamp: new Date().toLocaleString(),
                data: {
                    incomes: allData.incomes,
                    expenses: allData.expenses,
                    payments: allData.payments,
                    attendance: allData.attendance,
                    vendors: allData.vendors
                }
            };

            await fetch(settings.googleSheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            alert("सिंक पूरा हुआ! आपका डेटा गूगल शीट को भेज दिया गया है।");
        } catch (error) {
            console.error(error);
            alert("सिंक फेल हो गया। कृपया URL चेक करें।");
        } finally {
            setIsSyncingSheets(false);
        }
    };

    const handleExportExcel = () => {
        let csvContent = "\ufeff";
        csvContent += "SHIKSHA SETU - FULL PROJECT REPORT\n";
        csvContent += `Project: ${settings.schoolName}\nReport Date: ${new Date().toLocaleString()}\n\n`;
        
        csvContent += "1. INCOME (पैसा आया)\n";
        csvContent += "Date,Amount,Paid By,Source,Mode,Remarks\n";
        allData.incomes.forEach(i => csvContent += `${i.date},${i.amount},${i.paidBy},${i.source},${i.mode},"${i.remarks}"\n`);
        const totInc = allData.incomes.reduce((s,i) => s + i.amount, 0);
        csvContent += `TOTAL INCOME,,₹ ${totInc},,,\n\n`;

        csvContent += "2. EXPENSES (सामान और अन्य खर्चे)\n";
        csvContent += "Date,Amount,Vendor/Paid To,Category,Sub-Category,Mode,Notes\n";
        allData.expenses.forEach(e => {
            const vendor = allData.vendors.find(v => String(v.id) === String(e.vendorId))?.name || e.paidTo;
            csvContent += `${e.date},${e.amount},${vendor},${e.category},${e.subCategory || '-'},${e.mode},"${e.notes}"\n`;
        });
        const totExp = allData.expenses.reduce((s,e) => s + e.amount, 0);
        csvContent += `TOTAL EXPENSES,,₹ ${totExp},,,,\n\n`;

        csvContent += "3. LABOUR PAYMENTS (मजदूरों का भुगतान)\n";
        csvContent += "Date,Amount,Worker Name,Type,Mode\n";
        allData.payments.forEach(p => {
            const worker = allData.labours.find(l => String(l.id) === String(p.labourId))?.name || 'Unknown';
            csvContent += `${p.date},${p.amount},${worker},${p.type},${p.mode}\n`;
        });
        const totLab = allData.payments.reduce((s,p) => s + p.amount, 0);
        csvContent += `TOTAL LABOUR PAYMENTS,,₹ ${totLab},,\n\n`;

        csvContent += "--- GRAND SUMMARY ---\n";
        csvContent += `TOTAL INCOME,₹ ${totInc}\n`;
        csvContent += `TOTAL EXPENSE (Material + Labour),₹ ${totExp + totLab}\n`;
        csvContent += `BALANCE IN HAND,₹ ${totInc - (totExp + totLab)}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Report_${settings.schoolName.replace(/\s+/g, '_')}_Full.csv`;
        link.click();
    };

    const handleDataReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.confirmDelete)) {
            onReset();
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800">{t.settings}</h2>

            {/* Google Sheets Integration */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2.5 rounded-2xl text-green-600">
                            <Table size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">गूगल शीट सिंक (Google Sheet Sync)</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Automatic Data Export</p>
                        </div>
                    </div>
                    <button onClick={() => setShowHelp(!showHelp)} className="text-slate-400 p-2 active:bg-slate-50 rounded-full">
                        <HelpCircle size={20} />
                    </button>
                </div>

                {showHelp && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 text-[11px] text-green-800 animate-in fade-in zoom-in duration-300">
                        <p className="font-bold mb-1">Spreadsheet Setup Guide:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Open a Google Sheet.</li>
                            <li>Go to <b>Extensions > Apps Script</b>.</li>
                            <li>Paste a simple <code className="bg-white px-1">doPost(e)</code> script to save data.</li>
                            <li>Click <b>Deploy > New Deployment > Web App</b>.</li>
                            <li>Select <b>Who has access: Anyone</b>.</li>
                            <li>Copy the <b>Web App URL</b> and paste it below.</li>
                        </ol>
                    </div>
                )}

                <div className="space-y-3">
                    <input 
                        type="url" 
                        placeholder="Apps Script Web App URL यहाँ डालें" 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs outline-none focus:border-green-400 transition-all font-medium"
                        value={settings.googleSheetUrl || ''}
                        onChange={e => onUpdate({...settings, googleSheetUrl: e.target.value})}
                    />
                    <button 
                        onClick={handleSyncToGoogleSheets}
                        disabled={isSyncingSheets}
                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSyncingSheets ? <Loader2 className="animate-spin" size={18} /> : <Cloud size={18} />}
                        {t.syncSheetNow}
                    </button>
                </div>
            </div>

            {/* Excel Reports */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600">
                        <FileSpreadsheet size={22} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Full Project Excel Report</h3>
                </div>
                <button onClick={handleExportExcel} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                    <Download size={18} /> Download Everything (Excel)
                </button>
                <p className="text-[9px] text-center text-slate-400 font-medium">Income + Material + Labour included</p>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
                        <Download size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">परमानेंट बैकअप (Manual Backup)</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Safety first</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleDownloadJSON} className="flex items-center justify-between p-5 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-100 active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <FileJson size={20} />
                            <span className="text-xs font-black uppercase tracking-wider tracking-tighter">Download JSON Backup</span>
                        </div>
                        <Download size={16} />
                    </button>

                    <button onClick={handleCopyToClipboard} className="flex items-center justify-between p-5 bg-slate-800 text-white rounded-3xl active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            {isCopied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                            <span className="text-xs font-black uppercase tracking-wider tracking-tighter">Copy All Data (WhatsApp)</span>
                        </div>
                        <Share2 size={16} />
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-dashed border-slate-200 text-slate-600 rounded-3xl font-bold text-xs active:bg-slate-50 transition-all">
                        <RefreshCw size={18} />
                        पुराना डेटा रिस्टोर करें (Import)
                    </button>
                    <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            try {
                                const data = JSON.parse(ev.target?.result as string);
                                if (window.confirm("क्या आप डेटा रिस्टोर करना चाहते हैं? अभी वाला डेटा मिट जाएगा।")) onImport(data);
                            } catch { alert("Invalid backup file!"); }
                        };
                        reader.readAsText(file);
                    }} />
                </div>
            </div>

            {/* App Installation */}
            <div className={`p-6 rounded-[32px] text-white shadow-xl ${isIOS ? 'bg-slate-900' : 'bg-blue-900'}`}>
                <div className="flex items-center gap-4 mb-4">
                    {isIOS ? <Apple size={24} /> : <Smartphone size={24} />}
                    <div>
                        <h3 className="font-bold text-sm leading-tight">{t.installApp}</h3>
                        <p className="text-[10px] text-white/60 font-medium">{t.installDesc}</p>
                    </div>
                </div>
                <button onClick={handleInstallApp} className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all shadow-lg">
                    {isIOS ? "Show Instructions" : "Install Now"}
                </button>
            </div>

            {/* Language Selection */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Languages size={20} className="text-slate-400" />
                    <span className="font-bold text-sm text-slate-800">Language / भाषा</span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['en', 'hi'] as const).map(l => (
                        <button key={l} onClick={() => onUpdate({...settings, language: l})} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${settings.language === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                <button onClick={handleDataReset} className="w-full py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-black text-xs active:bg-rose-600 active:text-white transition-all flex items-center justify-center gap-2">
                    <Trash2 size={18} /> DELETE ALL DATA
                </button>
            </div>
        </div>
    );
};

export default SettingsView;
