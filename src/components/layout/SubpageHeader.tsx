import { motion } from 'framer-motion';
import { cn } from '@/utils';

/** Shared type scale — bold, wide tracking, off-white (subpage chapter titles). */
export const subpageTitleClass =
  'text-balance font-black uppercase tracking-tighter text-[#F2F0EF] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight';

export const subpageSectionTitleClass =
  'text-balance font-bold uppercase tracking-wider text-[#F2F0EF] text-lg sm:text-xl md:text-2xl leading-tight';

export const subpageEyebrowClass =
  'mb-2 block text-[10px] font-medium uppercase tracking-[0.35em] text-red-primary md:text-xs';

export const subpageMetaClass =
  'mt-2 text-xs sm:text-sm uppercase tracking-wider text-zinc-400';

const titleShadow = '0 2px 12px rgba(0, 0, 0, 0.75), 0 1px 4px rgba(0, 0, 0, 0.5)';

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  /** Breadcrumb context, e.g. WORK for /work/videos */
  parent?: string;
  as?: 'h1' | 'h2';
  variant?: 'page' | 'section';
  align?: 'left' | 'center';
  className?: string;
  aside?: React.ReactNode;
  animate?: boolean;
}

export const SubpageHeader = ({
  title,
  subtitle,
  parent,
  as: Tag = 'h1',
  variant = 'page',
  align = 'left',
  className,
  aside,
  animate = true,
}: SubpageHeaderProps) => {
  const titleClass = variant === 'page' ? subpageTitleClass : subpageSectionTitleClass;

  const content = (
    <div
      className={cn(
        'relative z-10 flex flex-col gap-3',
        align === 'center'
          ? 'items-center text-center md:items-center'
          : 'md:flex-row md:items-start md:justify-between md:gap-6',
        className
      )}
    >
      <div
        className={cn(
          'min-w-0',
          align === 'center' && 'flex flex-col items-center text-center'
        )}
      >
        {parent && <span className={subpageEyebrowClass}>{parent}</span>}
        <Tag className={titleClass} style={{ textShadow: titleShadow }}>
          {title}
        </Tag>
        {subtitle && <p className={subpageMetaClass}>{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
};

/** Standard top spacing for subpage headers under MinimalNav. */
export const subpageHeaderShellClass =
  'container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-4 relative z-10';
