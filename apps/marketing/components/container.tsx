import { cn } from '@/lib/cn';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
};

const sizeClasses = {
  default: 'max-w-marketing',
  narrow: 'max-w-prose',
  wide: 'max-w-[90rem]',
};

export function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div className={cn('marketing-container', sizeClasses[size], className)}>{children}</div>
  );
}
