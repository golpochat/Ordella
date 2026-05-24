import { cn } from '@/lib/cn';

type SocialProofProps = {
  brands: string[];
  className?: string;
};

export function SocialProof({ brands, className }: SocialProofProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-5 xs:grid-cols-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 md:gap-x-14',
        className,
      )}
    >
      {brands.map((name) => (
        <li key={name} className="flex items-center justify-center px-2 text-center">
          <span className="text-sm font-semibold tracking-tight text-slate sm:text-base md:text-lg">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}
