import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-govblue text-white hover:bg-govblue-dark',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-slate-50',
  danger: 'bg-emergency text-white hover:bg-emergency-dark',
  ghost: 'text-govblue hover:bg-slate-100',
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
