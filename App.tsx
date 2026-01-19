
import React, { useState, useEffect } from 'react';
import { LabelData, Margins, ThemeType } from './types';
import LabelPreview from './components/LabelPreview';
import Controls from './components/Controls';
import { Printer, MapPin, Box, Zap, Command } from 'lucide-react';

// Robust Hook for Data Parsing with Error Handling for Khmer/Special Chars
const useLabelData = () => {
  const [data, setData] = useState<LabelData>({
    id: 'ORD-001',
    name: 'Customer Name',
    phone: '012 345 678',
    location: 'Phnom Penh',
    address: '#123, Street ABC, Khan XYZ',
    store: 'ACC Store',
    page: 'FB Page',
    user: 'Admin',
    total: '0.00',
    shipping: 'N/A',
    payment: 'Unpaid',
    note: '',
    mapLink: '',
    date: new Date().toLocaleDateString('en-GB')
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === '') return; 

    const safeGet = (key: string, def: string = '') => {
        const val = params.get(key);
        if (!val) return def;
        try {
            // URLSearchParams already decodes most things, 
            // but double decoding can crash if there's a literal '%'
            return decodeURIComponent(val);
        } catch (e) {
            return val; // Fallback to raw value if decoding fails
        }
    };

    let mapLink = safeGet('map');
    const note = safeGet('note');
    
    // Auto-detect map link in text
    if (!mapLink || mapLink === 'undefined' || mapLink === 'null') {
      const fullText = `${safeGet('address')} ${safeGet('location')} ${note}`;
      const match = fullText.match(/(https?:\/\/[^\s]+)/g);
      if (match) mapLink = match[0];
    }

    // Clean address by removing the link if present
    let address = safeGet('address');
    if (mapLink && address) {
        address = address.replace(mapLink, '').trim();
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

    const storeName = safeGet('store', 'ACC Store');

    setData({
      id: safeGet('id', '...'),
      name: safeGet('name', '...'),
      phone: safeGet('phone', '...'),
      location: safeGet('location', '...'),
      address: address || '...',
      store: storeName !== 'Unknown' && storeName !== 'undefined' ? storeName : 'ACC Store',
      page: safeGet('page', 'N/A'),
      user: safeGet('user', 'N/A'),
      total: params.get('total') ? parseFloat(params.get('total')!).toFixed(2) : '0.00',
      shipping: safeGet('shipping', 'N/S'),
      payment: safeGet('payment', 'Unpaid'),
      note: note,
      mapLink: mapLink,
      date: formattedDate
    });
  }, []);

  return data;
};

const App: React.FC = () => {
  const data = useLabelData();
  const [theme, setTheme] = useState<ThemeType>(ThemeType.ACC);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [margins, setMargins] = useState<Margins>({
    top: 0, right: 0, bottom: 0, left: 0, lineLeft: 0, lineRight: 2
  });
  
  useEffect(() => {
    if (data.store === 'Flexi Gear') setTheme(ThemeType.FLEXI);
    else setTheme(ThemeType.ACC);
  }, [data.store]);

  useEffect(() => {
    const loadMargin = (key: keyof Margins) => {
      const saved = localStorage.getItem(`label_${key}`);
      return saved ? parseFloat(saved) : 0;
    };
    setMargins({
      top: loadMargin('top'),
      right: loadMargin('right'),
      bottom: loadMargin('bottom'),
      left: loadMargin('left'),
      lineLeft: loadMargin('lineLeft'),
      lineRight: localStorage.getItem('label_lineRight') ? parseFloat(localStorage.getItem('label_lineRight')!) : 2
    });
  }, []);

  const handleMarginChange = (key: keyof Margins, value: number) => {
    setMargins(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`label_${key}`, value.toString());
  };

  const handlePrint = (target: 'label' | 'qr') => {
    document.body.classList.remove('print-mode-label', 'print-mode-qr');
    document.body.classList.add(target === 'label' ? 'print-mode-label' : 'print-mode-qr');
    window.print();
  };

  return (
    <div className="flex h-screen bg-dark-950 font-sans text-slate-300 overflow-hidden selection:bg-brand-cyan/30 selection:text-brand-cyan">
      
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none no-print">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/10 blur-[120px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* Glass Sidebar */}
      <aside className="w-80 glass-panel border-r border-white/5 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)] no-print relative">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center shadow-lg shadow-brand-cyan/20">
                    <Box className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-wide text-white">Label<span className="text-brand-cyan">Ultra</span></span>
            </div>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto p-6">
             <Controls 
                margins={margins}
                onMarginChange={handleMarginChange}
                currentTheme={theme}
                onThemeChange={setTheme}
                isDesignMode={isDesignMode}
                onDesignModeToggle={setIsDesignMode}
            />
        </div>

        {/* Sidebar Footer (Print Actions) */}
        <div className="p-5 border-t border-white/5 bg-black/20 space-y-3 backdrop-blur-md">
             <button 
                onClick={() => handlePrint('label')}
                className="group relative w-full overflow-hidden rounded-xl bg-brand-cyan p-[1px] shadow-lg shadow-brand-cyan/20 transition-all hover:shadow-brand-cyan/40 active:scale-[0.98]"
            >
                <div className="relative flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 transition-all group-hover:bg-opacity-0">
                    <Printer className="w-4 h-4 text-brand-cyan group-hover:text-white transition-colors" />
                    <span className="font-bold text-sm text-white uppercase tracking-wider">Print Label</span>
                </div>
            </button>
            <button 
                onClick={() => handlePrint('qr')}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors active:scale-[0.98]"
            >
                <MapPin className="w-4 h-4 text-brand-purple" /> Driver QR Code
            </button>
        </div>
      </aside>

      {/* Main Content (Preview) */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 no-print glass-panel bg-transparent">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
                    <Command className="w-3 h-3" />
                    System Status
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-emerald-400 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    READY
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Order ID</div>
                    <div className="text-sm font-mono text-brand-cyan font-bold">{data.id}</div>
                 </div>
            </div>
        </header>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative bg-dark-950/50">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            
            <div className="w-full max-w-6xl relative z-10">
                <LabelPreview 
                    data={data}
                    theme={theme}
                    margins={margins}
                    isDesignMode={isDesignMode}
                />
            </div>
        </div>
      </main>

      <style>{`
        @page { size: 80mm 60mm; margin: 0; }
        @media print {
            body { background: white !important; color: black !important; }
            .no-print { display: none !important; }
            .printable-label { transform: none !important; box-shadow: none !important; margin: 0 !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
