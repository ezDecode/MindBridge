const PLACEHOLDER_NAME_PATTERN = /^(student|user|counselor)([\s_-]*\d+)?$/i

function toTitleCase(value: string) {
 return value
 .split(/\s+/)
 .filter(Boolean)
 .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
 .join(' ')
}

export function normalizeName(value: string | null | undefined) {
 if (typeof value !== 'string') return null
 const trimmed = value.trim().replace(/\s+/g, ' ')
 return trimmed.length > 0 ? trimmed : null
}

export function isPlaceholderName(value: string | null | undefined) {
 const normalized = normalizeName(value)
 if (!normalized) return false
 return PLACEHOLDER_NAME_PATTERN.test(normalized)
}

export function deriveNameFromEmail(email: string | null | undefined) {
 if (!email) return null

 const localPart = email.split('@')[0]?.trim()
 if (!localPart || /^\d+$/.test(localPart)) return null

 const normalized = localPart
 .replace(/[._-]+/g, ' ')
 .replace(/\d+/g, ' ')
 .replace(/\s+/g, ' ')
 .trim()

 if (!normalized || isPlaceholderName(normalized)) return null
 return toTitleCase(normalized)
}

export function extractNameFromMetadata(metadata: Record<string, unknown> | null | undefined) {
 if (!metadata) return null

 const candidates = [metadata.full_name, metadata.name, metadata.display_name]

 for (const candidate of candidates) {
 const normalized = normalizeName(typeof candidate === 'string' ? candidate : null)
 if (normalized && !isPlaceholderName(normalized)) {
 return normalized
 }
 }

 return null
}

export function resolveProfileDisplayName({
 profileName,
 email,
 metadata,
}: {
 profileName: string | null | undefined
 email?: string | null
 metadata?: Record<string, unknown> | null
}) {
 const normalizedProfileName = normalizeName(profileName)
 if (normalizedProfileName && !isPlaceholderName(normalizedProfileName)) {
 return normalizedProfileName
 }

 const metadataName = extractNameFromMetadata(metadata)
 if (metadataName) return metadataName

 const emailName = deriveNameFromEmail(email)
 if (emailName) return emailName

 return null
}

export function firstNameOrFallback(name: string | null | undefined, fallback = 'there') {
 const normalized = normalizeName(name)
 if (!normalized || isPlaceholderName(normalized)) {
 return fallback
 }

 return normalized.split(' ')[0] || fallback
}
