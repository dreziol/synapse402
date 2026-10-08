import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoBadgeProps {
  text: string;
  title?: string;
}

export const InfoBadge: React.FC<InfoBadgeProps> = ({ text, title = 'Why this matters' }) => {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className="w-4 h-4 rounded-full bg-white/[.06] hover:bg-[#d7ff4f]/20 hover:text-[#d7ff4f] hover:border-[#d7ff4f]/40 text-zinc-400 inline-flex items-center justify-center border border-white/10 transition cursor-help"
        aria-label={title}
        aria-expanded={show}
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      {show && (
        <span className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-w-[min(18rem,calc(100vw-2rem))] p-3 rounded-xl bg-[#0b0d13] border border-white/20 text-zinc-200 text-[11.5px] font-sans shadow-2xl leading-relaxed pointer-events-none text-left backdrop-blur-md">
          <span className="text-[#d7ff4f] font-mono font-bold text-[10px] uppercase tracking-wider block mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-pulse"></span>
            {title}
          </span>
          <span className="block text-zinc-300">{text}</span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0b0d13]" />
        </span>
      )}
    </span>
  );
};
