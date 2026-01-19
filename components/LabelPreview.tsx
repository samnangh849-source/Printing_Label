import React from 'react';
import { LabelData, Margins, ThemeType } from '../types';
import LabelContent from './LabelContent';
import QRCode from './QRCode';
import { Eye, Printer, MousePointer2 } from 'lucide-react';

interface LabelPreviewProps {
  data: LabelData;
  theme: ThemeType;
  margins: Margins;
  isDesignMode: boolean;
}

const LabelPreview: React.FC<LabelPreviewProps> = ({ data, theme, margins, isDesignMode }) => {
  
  // Construct dynamic action URL
  const baseUrl = "https://oder-backend-2.onrender.com/CustomerAction.html";
  const mapParam = data.mapLink ? encodeURIComponent(data.mapLink) : "";
  const qrValue = `${baseUrl}?id=${encodeURIComponent(data.id)}&name=${encodeURIComponent(data.name)}&phone=${encodeURIComponent(data.phone)}&map=${mapParam}`;

  const getQrFooter = () => {
    const features = [];
    if (data.mapLink) features.push("Map");
    if (data.phone) { features.push("Tel"); features.push("Tele"); }
    return features.length > 0 ? `Links: ${features.join(" / ")}` : "Scan for Info";
  };

  const sheetStyle: React.CSSProperties = {
    width: '80mm',
    height: '60mm',
    paddingTop: `${margins.top}mm`,
    paddingRight: `${margins.right}mm`,
    paddingBottom: `${margins.bottom}mm`,
    paddingLeft: `${margins.left}mm`,
  };

  return (
    <div className="flex flex-col xl:flex-row gap-12 items-center justify-center w-full min-h-[500px]">
      
      {/* 1. Main Shipping Label Preview */}
      <div className="flex flex-col gap-6 items-center label-preview-container flex-1 w-full max-w-[420px]">
        {/* Card Container */}
        <div className={`
             relative group transition-all duration-300 w-full flex justify-center
             ${isDesignMode ? 'scale-100' : 'hover:scale-[1.02]'}
        `}>
            {/* Theme Indicator Glow */}
            <div className={`absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500 ${
                theme === ThemeType.FLEXI ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-brand-cyan to-brand-purple'
            }`}></div>
            
            {/* Main Panel */}
            <div className="relative w-full bg-slate-900 border border-white/10 p-8 rounded-xl flex flex-col items-center shadow-2xl">
                 
                 {/* Design Mode Hint Overlay */}
                 {isDesignMode && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 z-20 animate-pulse">
                        <MousePointer2 className="w-3 h-3" />
                        Click to Edit • Scroll to Resize
                    </div>
                 )}

                 {/* Label Canvas */}
                 <div className={`
                     relative bg-white transition-all duration-300
                     ${isDesignMode ? 'ring-2 ring-brand-cyan ring-offset-4 ring-offset-slate-900 cursor-text shadow-none' : 'shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
                 `}>
                    <div 
                        className="printable-label overflow-hidden bg-white text-black"
                        style={sheetStyle}
                    >
                        <LabelContent 
                            data={data} 
                            theme={theme} 
                            lineLeft={margins.lineLeft} 
                            lineRight={margins.lineRight}
                            qrValue={qrValue}
                            isDesignMode={isDesignMode}
                        />
                    </div>
                 </div>

                 {/* Tech Decorations */}
                 <div className="absolute top-4 right-4 flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${theme === ThemeType.FLEXI ? 'bg-amber-500/20' : 'bg-brand-cyan/20'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full ${theme === ThemeType.FLEXI ? 'bg-amber-500/40' : 'bg-brand-cyan/40'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full ${theme === ThemeType.FLEXI ? 'bg-amber-500' : 'bg-brand-cyan'}`}></div>
                 </div>
                 
                 <div className="mt-6 w-full flex justify-between items-center text-xs font-mono text-slate-500 no-print">
                    <div className="flex items-center gap-1">
                        <Printer className="w-3 h-3" />
                        <span>80x60mm</span>
                    </div>
                    <div className={theme === ThemeType.FLEXI ? 'text-amber-500' : 'text-brand-cyan'}>
                        {theme === ThemeType.FLEXI ? 'INDUSTRIAL' : 'RETAIL'}
                    </div>
                 </div>
            </div>
        </div>
        
        <div className="text-center no-print">
            <h4 className="text-sm font-display font-bold text-slate-300 tracking-wider">SHIPPING LABEL</h4>
            <div className={`h-0.5 w-8 mx-auto mt-2 rounded-full ${theme === ThemeType.FLEXI ? 'bg-amber-500/50' : 'bg-brand-cyan/50'}`}></div>
        </div>
      </div>

      {/* 2. Driver QR Label Preview */}
      <div className="flex flex-col gap-6 items-center qr-preview-container flex-1 w-full max-w-[420px]">
        <div className={`
             relative group transition-all duration-300 w-full flex justify-center
             ${isDesignMode ? 'scale-100' : 'hover:scale-[1.02]'}
        `}>
             <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-pink rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>

            <div className="relative w-full bg-slate-900 border border-white/10 p-8 rounded-xl flex flex-col items-center shadow-2xl">
                <div className={`
                     relative bg-white transition-all duration-300
                     ${isDesignMode ? 'ring-2 ring-brand-purple ring-offset-4 ring-offset-slate-900' : 'shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
                `}>
                    <div 
                        className="printable-label bg-white text-black overflow-hidden flex flex-col items-center justify-center text-center p-4"
                        style={sheetStyle}
                    >
                        <h2 className="text-[11pt] font-extrabold uppercase mb-2 tracking-tight">Driver Scan</h2>
                        <div className="w-[28mm] h-[28mm] bg-white p-1">
                            <QRCode value={qrValue} size={128} />
                        </div>
                        <div className="mt-3 border border-black rounded px-2 py-1 text-[7pt] font-bold max-w-full">
                            {getQrFooter()}
                        </div>
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div>
                 </div>
                 
                 <div className="mt-6 w-full flex justify-between items-center text-xs font-mono text-slate-500 no-print">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Quick Scan</span>
                    </div>
                    <div className="text-brand-purple">ACTIVE</div>
                 </div>
            </div>
        </div>
        
        <div className="text-center no-print">
            <h4 className="text-sm font-display font-bold text-slate-300 tracking-wider">DRIVER QR</h4>
             <div className="h-0.5 w-8 bg-brand-purple/50 mx-auto mt-2 rounded-full"></div>
        </div>
      </div>
      
    </div>
  );
};

export default LabelPreview;