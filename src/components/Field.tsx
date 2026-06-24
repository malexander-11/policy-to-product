import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputBase =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:outline-none focus-visible:outline-none'

function borderClass(error?: string) {
  return error ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-govblue'
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {label}
        {required && <span className="text-red-600"> (required)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-midgrey">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-sm font-semibold text-red-700">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

interface BaseProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
}

export function TextInput({
  id,
  label,
  hint,
  error,
  required,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${inputBase} ${borderClass(error)}`}
        {...props}
      />
    </FieldShell>
  )
}

export function TextArea({
  id,
  label,
  hint,
  error,
  required,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${inputBase} ${borderClass(error)} min-h-[7rem]`}
        {...props}
      />
    </FieldShell>
  )
}

export function Select({
  id,
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${inputBase} ${borderClass(error)} pr-8`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export function CheckboxCard({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-3 rounded-lg border p-3.5 transition-colors ${
        checked ? 'border-govblue bg-blue-50/60' : 'border-slate-300 bg-white hover:bg-slate-50'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 text-govblue focus:ring-govblue"
      />
      <span>
        <span className="block text-sm font-semibold text-navy">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-midgrey">{description}</span>}
      </span>
    </label>
  )
}
