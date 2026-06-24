import { Callout } from './Callout'

export function EmergencyGuidance({ compact = false }: { compact?: boolean }) {
  return (
    <Callout tone="emergency" title="In an emergency, do not use this online form">
      <p>
        If there is an immediate risk to life, health or property, call <strong>999</strong>. If you smell gas, call
        the National Gas Emergency line on <strong>0800 111 999</strong>.
      </p>
      {!compact && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>A smell of gas or suspected carbon monoxide</li>
          <li>Fire, or sparks and burning smells from electrics</li>
          <li>Major flooding or a burst pipe you cannot stop</li>
          <li>Anything that puts someone in immediate danger</li>
        </ul>
      )}
      <p className="mt-2">
        For out-of-hours emergency repairs, call the council on <strong>0800 123 4567</strong>.{' '}
        <span className="text-midgrey">(Phone numbers are illustrative in this prototype.)</span>
      </p>
    </Callout>
  )
}
