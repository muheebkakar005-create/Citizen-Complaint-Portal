import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    xs: { img: 'w-7 h-7', text: 'text-xs', sub: 'text-[9px]' },
    sm: { img: 'w-9 h-9', text: 'text-sm', sub: 'text-[10px]' },
    md: { img: 'w-11 h-11', text: 'text-base', sub: 'text-[11px]' },
    lg: { img: 'w-16 h-16', text: 'text-xl', sub: 'text-xs' },
    hero: { img: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem Container with interactive motion hover */}
      <motion.div
        whileHover={{ scale: 1.06, rotate: [-1, 1, 0] }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className={`${currentSize.img} rounded-xl bg-white p-1 flex items-center justify-center border border-brand-cyan/40 shadow-sm overflow-hidden flex-shrink-0 group hover:border-brand-pink transition-colors cursor-pointer`}
      >
        <img
          src="/logo.jpg"
          alt="Citizen Complaint Official Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            // High quality fallback vector emblem if image loading fails
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center text-slate-900 font-serif">
                  <span class="text-[9px] font-bold tracking-tighter">CITIZEN</span>
                  <svg class="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
              `;
            }
          }}
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif font-bold tracking-tight text-white ${currentSize.text} capitalize`}
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Citezan Complent
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-pink text-white uppercase tracking-wider">
              Portal
            </span>
          </div>
          <span className={`text-brand-cyan font-mono tracking-wider uppercase font-semibold ${currentSize.sub}`}>
            Civic Grievance & Incident Grid
          </span>
        </div>
      )}
    </div>
  );
};
