import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputBase =
  'block w-full border-2 bg-white px-3 py-2 text-base text-ink placeholder:text-midgrey focus:outline-none'

function borderClass(error?: string) {
  return error ? 'border-emergency' : 'border-ink'
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
    <div className={error ? 'border-l-4 border-emergency pl-4' : ''}>
      <label htmlFor={id} className="block text-base font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-base text-midgrey">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-base font-bold text-emergency">
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
      <div className="mt-2">{children}</div>
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
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-8 w-8 shrink-0 border-2 border-ink text-govblue"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-base font-bold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-base text-midgrey">{description}</span>}
      </label>
    </div>
  )
}
