import Link from 'next/link';
import { Logo as OrdellaLogo } from '@shared-ui';
import { cn } from '@/lib/cn';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn('group inline-flex transition-opacity hover:opacity-90', className)}>
      <OrdellaLogo variant="full" size="md" color="auto" className="transition-transform group-hover:scale-[1.02]" />
    </Link>
  );
}
