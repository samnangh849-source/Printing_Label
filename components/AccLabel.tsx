import React from 'react';
import { LabelData } from '../types';
import { SmartText, SmartQR } from './SmartElements';
import { AlertTriangle, CheckCircle2, Banknote } from 'lucide-react';

interface AccLabelProps {
  data: LabelData;
  qrValue: string;
  isDesignMode: boolean;
}

const AccLabel: React.FC<AccLabelProps> = ({ data, qrValue, isDesignMode }) => {
  // Calculate COD Status
  const totalAmount = parseFloat(data.total);
  const isCOD = totalAmount > 0;
  
  // Enhanced Payment Label
  const getPaymentLabel = (text: string) => {
      const upperText = text.toUpperCase();
      if ((isCOD || upperText === 'UNPAID') && !upperText.includes('COD')) {
          return `${text} (COD)`;
      }
      return text;
  };
  const paymentLabel = getPaymentLabel(data.payment);

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 font-sans p-0.5 relative overflow-hidden">
        {/* Professional Background Watermark - Increased Opacity for better visibility */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="relative flex items-center justify-center">
                <span className={`text-[72pt] font-black uppercase tracking-tighter rotate-[-25deg] select-none opacity-[0.12] ${isCOD ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isCOD ? 'C.O.D' : 'PAID'}
                </span>
            </div>
        </div>

        <div className="flex-1 border-[2.5px] border-slate-900 rounded-lg flex flex-col overflow-hidden min-h-0 relative z-10 bg-transparent">
            
            {/* Header - Slim */}
            <div className="bg-slate-900 text-white px-2 py-1 flex justify-between items-center shrink-0">
                <SmartText isDesignMode={isDesignMode} initialValue={data.store} baseSize={11} bold font="sans" />
                <div className="bg-white text-slate-900 px-1 py-0.5 rounded text-[6.5pt] font-mono font-bold">
                    #{data.id}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Side: Recipient Info */}
                <div className="flex-1 p-2 flex flex-col gap-0.5 min-w-0 bg-white/30 backdrop-blur-[0.5px]">
                    <span className="text-[5.5pt] uppercase tracking-wider text-slate-400 font-bold">Deliver To</span>
                    
                    <SmartText isDesignMode={isDesignMode} initialValue={data.name} baseSize={11} bold font="sans" block />
                    <SmartText isDesignMode={isDesignMode} initialValue={data.phone} baseSize={10} bold font="sans" block className="text-slate-800" />
                    
                    <div className="mt-auto pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="w-1 h-1 bg-brand-cyan rounded-full"></span>
                            <SmartText isDesignMode={isDesignMode} initialValue={data.location} baseSize={8} bold font="sans" />
                        </div>
                        <SmartText isDesignMode={isDesignMode} initialValue={data.address} baseSize={7.5} font="sans" block className="leading-tight text-slate-500 max-h-[14mm] overflow-hidden" />
                    </div>
                </div>

                {/* Right Side: Sidebar - Optimized for Vertical Integrity */}
                <div className="w-[30mm] bg-slate-50/60 border-l-[2px] border-slate-900 p-1 flex flex-col items-center text-center shrink-0 min-h-0 overflow-hidden">
                    
                    {/* QR Section */}
                    <div className="bg-white p-0.5 rounded border border-slate-200 mb-1">
                         <SmartQR value={qrValue} baseSize={52} isDesignMode={isDesignMode} />
                    </div>
                    
                    <div className="w-full mb-1 flex justify-between items-center px-0.5 border-b border-slate-200 pb-0.5">
                        <span className="text-[4.5pt] text-slate-400 font-bold">DATE:</span>
                        <SmartText isDesignMode={isDesignMode} initialValue={data.date} baseSize={5.5} font="mono" className="text-slate-400" />
                    </div>
                    
                    {/* Shipping Info */}
                    <div className="w-full mb-1 bg-white/80 px-1 py-0.5 rounded border border-slate-200 flex flex-col items-start">
                        <div className="text-[4pt] text-slate-400 uppercase font-black">VIA:</div>
                        <SmartText isDesignMode={isDesignMode} initialValue={data.shipping} baseSize={7} bold font="sans" className="text-slate-800" block align="left" />
                    </div>
                    
                    {/* PRICE SECTION - GUARANTEED BOTTOM VISIBILITY */}
                    <div className="w-full mt-auto flex flex-col gap-0.5">
                        <div className="text-[5pt] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Total Due</div>
                        
                        {isCOD ? (
                            <div className="bg-red-600 text-white rounded p-1 shadow-md border-[1.5px] border-red-800 relative overflow-hidden">
                                <div className="absolute -right-1 -top-1 text-red-800 opacity-25 rotate-12 pointer-events-none">
                                    <Banknote size={24} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center gap-0.5 mb-0.5 bg-yellow-400 text-red-900 px-0.5 rounded-[1.5px]">
                                        <AlertTriangle size={6} strokeWidth={4} />
                                        <span className="text-[5.5pt] font-black uppercase tracking-tighter">COD UNPAID</span>
                                    </div>
                                    <SmartText 
                                        isDesignMode={isDesignMode} 
                                        initialValue={`$${data.total}`} 
                                        baseSize={14} 
                                        bold 
                                        font="sans" 
                                        align="center" 
                                        block 
                                        className="text-white drop-shadow-sm leading-none" 
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 text-emerald-900 rounded p-1 border-[1.5px] border-emerald-500 relative">
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="flex items-center justify-center gap-0.5 mb-0.5 text-emerald-700">
                                        <CheckCircle2 size={7} />
                                        <span className="text-[5pt] font-black uppercase">PAID FULL</span>
                                    </div>
                                    <SmartText 
                                        isDesignMode={isDesignMode} 
                                        initialValue={`$${data.total}`} 
                                        baseSize={12} 
                                        bold 
                                        font="sans" 
                                        align="center" 
                                        block 
                                        className="text-emerald-900 leading-none"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-0.5 flex flex-col items-center bg-white/70 rounded">
                             <SmartText isDesignMode={isDesignMode} initialValue={paymentLabel} baseSize={6.5} bold font="sans" className="text-slate-900 leading-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Minimalist */}
            <div className="bg-slate-50 border-t-[1.5px] border-slate-900 py-0.5 text-center flex justify-between items-center px-2 shrink-0">
                 <SmartText isDesignMode={isDesignMode} initialValue={data.page || "STORE"} baseSize={6.5} font="sans" bold />
                 <span className="text-[4.5pt] text-slate-400 font-bold uppercase">Professional Delivery</span>
            </div>
        </div>
    </div>
  );
};

export default AccLabel;