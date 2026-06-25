import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

// GDS button: square, bold 19px, with the signature 2px shadow that "presses"
// down on :active.
const base =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-bold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-govgreen text-white shadow-[0_2px_0_#002d18] hover:bg-govgreen-dark active:translate-y-[2px] active:shadow-none',
  secondary:
    'bg-lightgrey text-ink shadow-[0_2px_0_#929191] hover:bg-[#dbdad9] active:translate-y-[2px] active:shadow-none',
  danger:
    'bg-emergency text-white shadow-[0_2px_0_#55150b] hover:bg-emergency-dark active:translate-y-[2px] active:shadow-none',
  ghost: 'text-govblue underline hover:text-govblue-dark hover:no-underline',
}

export function buttonClasses(variant: ButtonVariant = 'primary', extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />
}
