import React, { useState, useEffect, useRef } from 'react';
import QRCode from './QRCode';

// ==========================================
// SMART TEXT COMPONENT
// ==========================================
export interface SmartTextProps {
  initialValue: string;
  className?: string;
  isDesignMode: boolean;
  baseSize: number;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  font?: 'sans' | 'mono';
  block?: boolean;
}

interface StateSnapshot {
  pos: { x: number, y: number };
  size: number;
}

export const SmartText: React.FC<SmartTextProps> = ({ 
  initialValue, 
  className = '', 
  isDesignMode, 
  baseSize,
  bold = false,
  align = 'left',
  font = 'sans',
  block = false
}) => {
  const [text, setText] = useState(initialValue);
  const [size, setSize] = useState(baseSize);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);
  
  // Undo/Redo History
  const [history, setHistory] = useState<StateSnapshot[]>([{ pos: { x: 0, y: 0 }, size: baseSize }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  useEffect(() => { setText(initialValue); }, [initialValue]);

  const saveToHistory = (newPos: {x: number, y: number}, newSize: number) => {
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      // Avoid duplicate states
      const last = updated[updated.length - 1];
      if (last && last.pos.x === newPos.x && last.pos.y === newPos.y && last.size === newSize) return prev;
      return [...updated, { pos: { ...newPos }, size: newSize }];
    });
    setHistoryIndex(prev => prev + 1);
  };

  // Listener for Sidebar Events
  useEffect(() => {
    if (!isSelected || !isDesignMode) return;

    const handleDesignAction = (e: any) => {
        const { type, payload } = e.detail;
        if (type === 'move') {
            const newPos = { 
                x: pos.x + (payload.x || 0), 
                y: pos.y + (payload.y || 0) 
            };
            setPos(newPos);
            saveToHistory(newPos, size);
        }
        if (type === 'size') {
             const newSize = Math.max(4, Math.min(80, size + payload));
             setSize(newSize);
             saveToHistory(pos, newSize);
        }
        if (type === 'undo') {
            if (historyIndex > 0) {
                const prevState = history[historyIndex - 1];
                setPos(prevState.pos);
                setSize(prevState.size);
                setHistoryIndex(historyIndex - 1);
            }
        }
        if (type === 'redo') {
            if (historyIndex < history.length - 1) {
                const nextState = history[historyIndex + 1];
                setPos(nextState.pos);
                setSize(nextState.size);
                setHistoryIndex(historyIndex + 1);
            }
        }
        if (type === 'reset') {
             setPos({x:0, y:0});
             setSize(baseSize);
             saveToHistory({x:0, y:0}, baseSize);
        }
    };

    window.addEventListener('design-action', handleDesignAction);
    return () => window.removeEventListener('design-action', handleDesignAction);
  }, [isSelected, isDesignMode, baseSize, pos, size, history, historyIndex]);

  // Global click listener to deselect
  useEffect(() => {
    if (!isSelected) return;
    const handleClickOutside = () => setIsSelected(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isSelected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesignMode) return;
    e.stopPropagation(); 
    e.preventDefault();
    
    if (!isSelected) setIsSelected(true);

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };
    hasMoved.current = false;
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy });
    };
    const onUp = () => {
      if (isDragging && hasMoved.current) {
         saveToHistory(pos, size);
      }
      setIsDragging(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, pos, size]);

  const style: React.CSSProperties = {
    fontSize: `${size}pt`,
    fontWeight: bold ? 700 : 400,
    textAlign: align,
    fontFamily: font === 'mono' ? '"JetBrains Mono", monospace' : '"Inter", sans-serif',
    lineHeight: 1.1,
    cursor: isDesignMode ? 'grab' : 'default',
    display: block ? 'block' : 'inline-block',
    width: block ? '100%' : 'auto',
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    position: 'relative',
    zIndex: isSelected || isDragging ? 50 : 'auto',
    userSelect: 'none',
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`relative transition-all rounded ${isDesignMode && !isSelected ? 'hover:bg-brand-cyan/10 hover:ring-1 hover:ring-brand-cyan/50' : ''} ${isSelected ? 'ring-1 ring-brand-cyan border border-brand-cyan/30 bg-brand-cyan/5 text-black' : ''} ${className}`}
      style={style}
    >
      {text}
    </div>
  );
};


// ==========================================
// SMART QR COMPONENT
// ==========================================
export const SmartQR: React.FC<{ value: string, baseSize: number, isDesignMode: boolean }> = ({ value, baseSize, isDesignMode }) => {
    const [size, setSize] = useState(baseSize);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // History
    const [history, setHistory] = useState<StateSnapshot[]>([{ pos: { x: 0, y: 0 }, size: baseSize }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    const saveToHistory = (newPos: {x: number, y: number}, newSize: number) => {
        setHistory(prev => {
          const updated = prev.slice(0, historyIndex + 1);
          const last = updated[updated.length - 1];
          if (last && last.pos.x === newPos.x && last.pos.y === newPos.y && last.size === newSize) return prev;
          return [...updated, { pos: { ...newPos }, size: newSize }];
        });
        setHistoryIndex(prev => prev + 1);
    };

    // Listener for Sidebar Events
    useEffect(() => {
        if (!isSelected || !isDesignMode) return;

        const handleDesignAction = (e: any) => {
            const { type, payload } = e.detail;
            if (type === 'move') {
                const newPos = { x: pos.x + (payload.x || 0), y: pos.y + (payload.y || 0) };
                setPos(newPos);
                saveToHistory(newPos, size);
            }
            if (type === 'size') {
                const newSize = Math.max(20, Math.min(200, size + (payload * 5)));
                setSize(newSize);
                saveToHistory(pos, newSize);
            }
            if (type === 'undo') {
                if (historyIndex > 0) {
                    const prevState = history[historyIndex - 1];
                    setPos(prevState.pos);
                    setSize(prevState.size);
                    setHistoryIndex(historyIndex - 1);
                }
            }
            if (type === 'redo') {
                if (historyIndex < history.length - 1) {
                    const nextState = history[historyIndex + 1];
                    setPos(nextState.pos);
                    setSize(nextState.size);
                    setHistoryIndex(historyIndex + 1);
                }
            }
            if (type === 'reset') {
                setPos({x:0, y:0});
                setSize(baseSize);
                saveToHistory({x:0, y:0}, baseSize);
            }
        };

        window.addEventListener('design-action', handleDesignAction);
        return () => window.removeEventListener('design-action', handleDesignAction);
    }, [isSelected, isDesignMode, baseSize, pos, size, history, historyIndex]);
  
    // Global click listener to deselect
    useEffect(() => {
        if (!isSelected) return;
        const handleClickOutside = () => setIsSelected(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isSelected]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!isDesignMode) return;
      e.stopPropagation();
      e.preventDefault();
      
      if (!isSelected) setIsSelected(true);

      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      startPos.current = { ...pos };
      hasMoved.current = false;
    };
  
    useEffect(() => {
      if (!isDragging) return;
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
        setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy });
      };
      const onUp = () => {
        if (isDragging && hasMoved.current) {
            saveToHistory(pos, size);
        }
        setIsDragging(false);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isDragging, pos, size]);
  
    return (
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
            transform: `translate(${pos.x}px, ${pos.y}px)`, 
            cursor: isDesignMode ? 'grab' : 'default',
            display: 'inline-block',
            zIndex: isSelected ? 50 : 'auto',
            position: 'relative'
        }}
        className={isDesignMode && !isSelected ? "hover:ring-1 hover:ring-brand-purple rounded" : ""}
      >
        <div className={isSelected ? "ring-2 ring-brand-purple bg-white shadow-xl" : ""}>
             <QRCode value={value} size={size} />
        </div>
      </div>
    );
};