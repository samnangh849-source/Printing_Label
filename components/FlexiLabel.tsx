import React from 'react';
import { LabelData } from '../types';
import { SmartText, SmartQR } from './SmartElements';

interface FlexiLabelProps {
  data: LabelData;
  qrValue: string;
  isDesignMode: boolean;
}

const FlexiLabel: React.FC<FlexiLabelProps> = ({ data, qrValue, isDesignMode }) => {
  // Calculate COD Status
  const totalAmount = parseFloat(data.total);
  const isCOD = totalAmount > 0;
  
  // Enhanced Payment Label for Visibility
  const getPaymentLabel = (text: string) => {
      const upperText = text.toUpperCase();
      if ((isCOD || upperText === 'UNPAID') && !upperText.includes('COD')) {
          return `${text} (COD)`;
      }
      return text;
  };
  const paymentLabel = getPaymentLabel(data.payment);

  return (
    <div className="flex flex-col h-full bg-white text-black font-mono overflow-hidden relative">
            {/* Background Watermark - Increased Opacity for stronger visibility */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <div className={`rotate-[-15deg] border-[8px] border-current px-6 py-2 flex flex-col items-center opacity-[0.12] ${isCOD ? 'text-black' : 'text-slate-500'}`}>
                    <span className="text-[58pt] font-black uppercase tracking-[-0.05em] leading-none">
                        {isCOD ? 'C.O.D' : 'PAID'}
                    </span>
                    <span className="text-[10pt] font-black tracking-[0.5em] mt-[-5pt] uppercase">Official Status</span>
                </div>
            </div>

            {/* Header - 10mm reduced from 12mm */}
            <div className="flex border-b-[3px] border-black h-[10mm] shrink-0 relative z-10 bg-white">
                <div className="w-[12mm] bg-[repeating-linear-gradient(45deg,#000,#000_2px,#fff_2px,#fff_4px)] border-r-[3px] border-black flex items-center justify-center">
                    <div className="bg-white px-1 border-2 border-black rotate-90 text-[7pt] font-black tracking-widest whitespace-nowrap">
                        PRTY
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center px-2 min-w-0">
                    <SmartText isDesignMode={isDesignMode} initialValue={data.store} baseSize={12} bold font="mono" />
                    <SmartText isDesignMode={isDesignMode} initialValue="LOGISTICS" baseSize={5} font="mono" className="tracking-[0.2em]" />
                </div>
                <div className="w-[28mm] bg-black text-white flex flex-col items-center justify-center p-1 shrink-0">
                    <span className="text-[5pt] uppercase opacity-75">Order ID</span>
                    <SmartText isDesignMode={isDesignMode} initialValue={data.id} baseSize={10} bold font="mono" className="text-white" />
                </div>
            </div>
            
            {/* Body */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative z-10 bg-transparent">
                <div className="flex-1 p-2.5 flex flex-col border-r-[3px] border-black relative min-w-0 bg-white/20">
                    <div className="absolute top-0 left-0 bg-black text-white px-1 text-[5pt] font-bold">RECIPIENT</div>
                    <div className="mt-2.5">
                        <SmartText isDesignMode={isDesignMode} initialValue={data.name} baseSize={11} bold font="mono" block />
                        <div className="my-0.5 border-b border-black border-dashed w-full opacity-30"></div>
                        <SmartText isDesignMode={isDesignMode} initialValue={data.phone} baseSize={10} bold font="mono" block />
                    </div>
                    <div className="mt-auto mb-1">
                        <SmartText isDesignMode={isDesignMode} initialValue={data.location} baseSize={8.5} bold font="mono" block />
                        <SmartText isDesignMode={isDesignMode} initialValue={data.address} baseSize={7.5} font="mono" block className="leading-tight mt-0.5 overflow-hidden max-h-[10mm]" />
                    </div>
                </div>

                {/* Sidebar - Compact */}
                <div className="w-[28mm] flex flex-col shrink-0 overflow-hidden bg-white/60">
                    {/* QR Container */}
                    <div className="h-[20mm] border-b-[3px] border-black p-1 flex items-center justify-center relative bg-white shrink-0">
                        <SmartQR value={qrValue} baseSize={55} isDesignMode={isDesignMode} />
                    </div>
                    
                    <div className="flex-1 flex flex-col p-1 gap-0.5 min-h-0 overflow-hidden">
                        {/* Compact Info Rows */}
                        <div className="space-y-0.5 border-b border-black/10 pb-1 bg-white/30">
                            <div className="flex flex-col">
                                <span className="text-[4.5pt] font-bold opacity-60">VIA:</span>
                                <SmartText isDesignMode={isDesignMode} initialValue={data.shipping} baseSize={6.5} bold font="mono" className="leading-none" />
                            </div>
                            <div className="flex justify-between items-center pt-0.5">
                                <span className="text-[4.5pt] font-bold">PAY:</span>
                                <SmartText isDesignMode={isDesignMode} initialValue={paymentLabel} baseSize={5.5} font="mono" align="right" />
                            </div>
                        </div>
                        
                        {/* Improved COD/Price Box - Scaled for visibility */}
                        <div className={`flex-1 border-[3px] border-black w-full relative overflow-hidden flex flex-col items-center justify-center ${isCOD ? 'bg-black' : 'bg-white'}`}>
                            
                            {isCOD ? (
                                <>
                                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 2px, transparent 2px, transparent 8px)'}}></div>
                                    <div className="relative z-10 flex flex-col items-center justify-center w-full px-1">
                                        <div className="bg-yellow-400 text-black text-[6.5pt] font-black uppercase tracking-tighter px-1 mb-0.5 border border-black">
                                            COD DUE
                                        </div>
                                        <SmartText isDesignMode={isDesignMode} initialValue={`$${data.total}`} baseSize={14} bold font="mono" className="text-yellow-400 leading-none" />
                                    </div>
                                </>
                            ) : (
                                <div className="relative z-10 flex flex-col items-center justify-center px-1">
                                    <div className="text-[5.5pt] font-bold mb-0.5 border border-black px-1 opacity-50">PREPAID</div>
                                    <div className="flex flex-col items-center">
                                        <SmartText isDesignMode={isDesignMode} initialValue={`$${data.total}`} baseSize={11} bold font="mono" className="text-black/30 line-through decoration-1" />
                                        <span className="text-[7.5pt] font-black tracking-widest leading-none">PAID</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - 4mm */}
            <div className="h-[4mm] bg-black text-white flex items-center justify-center gap-4 overflow-hidden relative z-20 shrink-0">
                <div className="w-full h-full flex items-center justify-center z-10">
                    <span className="bg-black px-2 text-[6pt] font-bold tracking-widest relative">
                        <SmartText isDesignMode={isDesignMode} initialValue={data.page || "FLEXI GEAR"} baseSize={6.5} bold font="mono" className="text-white" />
                    </span>
                </div>
            </div>
    </div>
  );
};

export default FlexiLabel;