import React from 'react';

interface SynapseSelectorProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  price?: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const SynapseSelector: React.FC<SynapseSelectorProps> = ({
  selected,
  onClick,
  title,
  subtitle,
  badge,
  price,
  disabled = false,
  icon,
  children,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full text-left p-4 rounded-xl transition-all duration-200 border ${
        selected
          ? 'bg-[#0c0e14] border-[#d7ff4f] shadow-[0_0_20px_rgba(215,255,79,0.12)]'
          : 'bg-[#0c0e14] border-white/10 hover:border-white/20 hover:bg-[#10131a]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-2 rounded-lg border ${
              selected ? 'border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#d7ff4f]' : 'border-white/10 bg-white/[0.03] text-zinc-400'
            }`}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold tracking-wide ${selected ? 'text-white' : 'text-zinc-200'}`}>
                {title}
              </span>
              {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 font-medium">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {price !== undefined && (
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#d7ff4f]">
              {typeof price === 'number' ? `$${price.toFixed(4)}` : price}
            </span>
          </div>
        )}
      </div>

      {children && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {children}
        </div>
      )}
    </button>
  );
};
