import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'hero';
}

export function CustomSelect({ value, onChange, options, placeholder, className = '', style, variant = 'default' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isHero = variant === 'hero';

  return (
    <div ref={ref} className="relative" style={{ ...style, minWidth: style?.minWidth || (isHero ? undefined : '160px') }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between gap-2 transition-all
          ${isHero
            ? 'px-4 py-2.5 border border-white/20 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4ade80]'
            : 'form-select text-left'
          }
          ${className}
        `}
        style={{ backgroundImage: 'none', paddingRight: '12px' }}
      >
        <span className={`truncate ${!selected ? (isHero ? 'text-white/60' : 'text-gray-400') : ''}`}>
          {selected?.label || placeholder || 'Chon...'}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isHero ? 'text-white/60' : 'text-gray-400'}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-full min-w-[180px] py-1 rounded-xl bg-white border border-gray-100 overflow-hidden"
          style={{
            boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
            animation: 'slideDown 0.15s ease',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {options.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors
                  ${isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="truncate">{opt.label}</span>
                {isActive && <Check className="w-4 h-4 text-green-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
