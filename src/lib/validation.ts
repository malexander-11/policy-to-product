// Resident-side submission guards (Feature 3).
//
// Keep junk out of the queue with friendly nudges, not hard errors: empty/spam/
// off-topic text, irrelevant images, and a standard virus/malware scan step.
// All checks are simulated — no real ML or AV engine — but they read as the
// ordinary, expected trust steps a resident would see.

export interface CheckResult {
  ok: boolean
  message?: string
}

// Words that signal a genuine home-repair report.
const REPAIR_SIGNALS = [
  'boiler', 'heat', 'heating', 'hot water', 'radiator', 'thermostat', 'cold', 'freezing',
  'leak', 'leaking', 'drip', 'water', 'pipe', 'burst', 'tap', 'toilet', 'drain', 'flood',
  'overflow', 'sink', 'basin', 'shower', 'bath', 'stopcock',
  'damp', 'mould', 'mold', 'condensation', 'ceiling', 'wall', 'plaster', 'crack',
  'electric', 'socket', 'plug', 'fuse', 'power', 'light', 'wiring', 'wire', 'spark', 'shock',
  'door', 'window', 'lock', 'latch', 'hinge', 'glaz', 'glass', 'handle',
  'broken', 'break', 'not working', "won't work", 'wont work', 'faulty', 'fault', 'damaged',
  'damage', 'repair', 'fix', 'stuck', 'blocked', 'loose', 'rot', 'rotten',
  'roof', 'floor', 'tile', 'gutter', 'heater', 'banging',
]

// Words that signal a non-repair complaint / off-topic message.
const OFFTOPIC_SIGNALS = [
  'unhappy', 'complaint', 'complain', 'rude', 'staff', 'neighbour', 'neighbor', 'noise',
  'noisy', 'rent', 'arrears', 'council tax', 'benefit', 'housing officer', 'antisocial',
  'harass', 'parking', 'bin collection', 'rehous', 'transfer', 'deposit', 'refund',
  'compensation', 'landlord',
]

function tokenCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function looksLikeSpam(text: string): boolean {
  const t = text.trim()
  if (/(https?:\/\/|www\.)/i.test(t)) return true
  if (/(.)\1{6,}/i.test(t)) return true // "aaaaaaa", "!!!!!!!"
  const letters = t.replace(/[^a-z]/gi, '')
  if (letters.length >= 8) {
    const vowels = (letters.match(/[aeiou]/gi) ?? []).length
    if (vowels / letters.length < 0.15) return true // gibberish like "kjsdfkjsdf"
  }
  return false
}

/**
 * Validate the free-text description before submission. Returns a helpful,
 * resident-facing message instead of a hard error when something is off.
 */
export function validateDescription(raw: string): CheckResult {
  const text = raw.trim()
  if (text.length === 0) return { ok: false, message: 'Please tell us what needs repairing.' }
  if (text.length < 12 || tokenCount(text) < 3)
    return { ok: false, message: 'Please describe the repair in a little more detail — what is wrong and where.' }
  if (looksLikeSpam(text))
    return { ok: false, message: 'That doesn’t look like a repair description. Please tell us what is wrong in your home.' }

  const lower = text.toLowerCase()
  const hasRepair = REPAIR_SIGNALS.some((w) => lower.includes(w))
  const offTopic = OFFTOPIC_SIGNALS.some((w) => lower.includes(w))

  if (!hasRepair && offTopic)
    return {
      ok: false,
      message:
        'This service is for repairs to your home (heating, leaks, damp, electrics, doors and windows). For other issues — like tenancy, rent or a complaint — please contact your housing officer.',
    }
  if (!hasRepair && tokenCount(text) < 6)
    return {
      ok: false,
      message: 'We couldn’t tell what needs repairing. Please describe the problem, for example “the bathroom tap is leaking”.',
    }
  return { ok: true }
}

// --- Evidence relevance + virus scan (both simulated) -----------------------

const IRRELEVANT_NAME_SIGNALS = [
  'screenshot', 'screen shot', 'screen-shot', 'selfie', 'meme', 'whatsapp', 'receipt',
  'invoice', 'ticket', 'boarding', 'passport', 'document', 'contract', 'avatar', 'profile',
]
const MALWARE_NAME_SIGNALS = ['.exe', '.bat', '.scr', '.js', '.msi', 'virus', 'malware', 'trojan', 'keygen', 'crack']

/** Simulated virus/malware scan. Blocks obviously executable/suspicious files. */
export function scanFileForThreats(name: string): CheckResult {
  const lower = name.toLowerCase()
  if (MALWARE_NAME_SIGNALS.some((s) => lower.includes(s)))
    return { ok: false, message: 'This file was blocked by our virus scan. Please upload a photo or video taken on your phone.' }
  return { ok: true }
}

/** Simulated relevance check — rejects images that don't look like the repair. */
export function validateEvidenceRelevance(name: string, type: 'image' | 'video'): CheckResult {
  const lower = name.toLowerCase()
  if (type === 'image' && IRRELEVANT_NAME_SIGNALS.some((s) => lower.includes(s)))
    return {
      ok: false,
      message:
        'This looks like it might not show the repair (for example a screenshot or an unrelated photo). Please upload a clear photo or video of the problem.',
    }
  return { ok: true }
}
