// Format de la copie de sécurité : les données, plus les PDF en texte (base64).
// Les copies faites avant les PDF restent lisibles.
import { parseData, type Data, type Trip } from './trips.ts'

export type StoredFile = { name: string; base64: string }
export type Backup = { data: Data; files: Record<string, StoredFile> }

export function fileIds(trips: Trip[]): string[] {
  return trips.flatMap((trip) => (trip.bookings ?? []).flatMap((b) => (b.file ? [b.file.id] : [])))
}

export function writeBackup(backup: Backup): string {
  return JSON.stringify({ ...backup.data, files: backup.files })
}

export function readBackup(text: string): Backup | null {
  const parsed = parseData(text)
  if (!parsed) return null
  const files: Record<string, StoredFile> = {}
  const raw: unknown = (JSON.parse(text) as { files?: unknown }).files ?? {}
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  for (const [id, file] of Object.entries(raw as Record<string, Partial<StoredFile>>)) {
    if (typeof file?.name !== 'string' || typeof file.base64 !== 'string') return null
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(file.base64)) return null
    files[id] = { name: file.name, base64: file.base64 }
  }
  return { data: { version: 1, trips: parsed.trips }, files }
}

export function toBase64(bytes: Uint8Array): string {
  let text = ''
  // Par morceaux : un gros fichier en un seul appel dépasserait les limites.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(text)
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
