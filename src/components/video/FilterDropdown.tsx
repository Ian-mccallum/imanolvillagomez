import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

/**
 * FilterDropdown
 * 
 * Dropdown component for selecting filter options
 * Carson: Experimental typography
 * Oliver: Dark aesthetic
 * West: Minimal, clean
 * Weirdcore: Subtle glitch effects on interaction
 */

interface FilterDropdownProps {
  label: string;
  options: string[] | number[];
  selected: string[] | number[];
  onSelect: (value: string | number) => void;
  onDeselect: (value: string | number) => void;
  type: 'artist' | 'location' | 'year' | 'tour' | 'category';
  darkBackground?: boolean;
  className?: string;
}

export const FilterDropdown = ({
  label,
  options,
  selected,
  onSelect,
  onDeselect,
  type: _type,
  darkBackground = false,
  className,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const handleToggle = (value: string | number) => {
    // Type-safe comparison
    const isSelected = typeof value === 'number'
      ? (selected as number[]).includes(value)
      : (selected as string[]).includes(value);
    
    if (isSelected) {
      onDeselect(value);
    } else {
      onSelect(value);
    }
  };

  const isSelected = (value: string | number) => {
    return typeof value === 'number'
      ? (selected as number[]).includes(value)
      : (selected as string[]).includes(value);
  };

  const hasActiveFilters = selected.length > 0;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-1.5 text-xs uppercase tracking-wider font-medium',
          'border transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-white/50',
          darkBackground
            ? 'bg-black/50 border-zinc-700 text-white hover:bg-black/70 hover:border-red-600'
            : 'bg-black/50 border-zinc-700 text-white hover:bg-black/70 hover:border-red-600',
          hasActiveFilters && 'border-red-600',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {label} {hasActiveFilters && `(${selected.length})`}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full left-0 mt-1 z-[9990]',
              'min-w-[200px] max-h-[300px] overflow-y-auto',
              'bg-black border border-zinc-700',
              'shadow-lg'
            )}
            role="listbox"
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-zinc-400 uppercase tracking-wider">
                No options
              </div>
            ) : (
              options.map((option) => {
                const selected = isSelected(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleToggle(option)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-xs uppercase tracking-wider',
                      'transition-colors',
                      'focus:outline-none focus:bg-zinc-900',
                      selected
                        ? 'bg-red-600/20 text-white font-medium border-l-2 border-red-600'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    )}
                    role="option"
                    aria-selected={selected}
                  >
                    <span className="flex items-center gap-2">
                      {selected && <span className="text-red-600">×</span>}
                      {option}
                    </span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

