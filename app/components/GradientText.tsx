import { cn } from '@shadcn-utils';

type GradientFrom = `from-${string}-${number}`;
type GradientTo = `to-${string}-${number}`;

interface GradientTextProps {
  text: string;
  gradientStart: GradientFrom;
  gradientEnd: GradientTo;
  className?: string;
}

export function GradientText({ text, gradientStart, gradientEnd, className }: GradientTextProps) {
  return (
    <h1
      className={cn(
        'text-transparent bg-clip-text bg-gradient-to-r',
        gradientStart,
        gradientEnd,
        className,
      )}
    >
      {text}
    </h1>
  );
}
