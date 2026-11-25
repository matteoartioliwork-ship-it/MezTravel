// Cherche des dates dans le texte d'une confirmation (it, en, fr, japonais, numérique).
// Ce ne sont que des propositions : la personne choisit toujours.
import { isDate } from './trips.ts'

export type FoundDate = {
  date: string
  excerpt: string // texte autour de la date, pour reconnaître de quoi il s'agit
  ambiguous: boolean // 03/04 : 3 avril ou 4 mars ?
}

// Débuts des noms de mois, sans accents.
const monthStarts: [string, number][] = [
  ['gen', 1], ['jan', 1], ['feb', 2], ['fev', 2], ['mar', 3], ['apr', 4], ['avr', 4],
  ['mag', 5], ['may', 5], ['mai', 5], ['giu', 6], ['jun', 6], ['juin', 6], ['lug', 7],
  ['jul', 7], ['juil', 7], ['ago', 8], ['aug', 8], ['aou', 8], ['set', 9], ['sep', 9],
  ['ott', 10], ['oct', 10], ['nov', 11], ['dic', 12], ['dec', 12],
]
const monthNames = [
  'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre',
  'january february march april may june july august september october november december',
  'janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre',
].map((line) => line.split(' '))

// Accepte le nom complet ou une abréviation d'au moins trois lettres.
function monthNumber(word: string): number | null {
  for (const names of monthNames) {
    const index = names.findIndex((name) => name === word || (word.length >= 3 && name.startsWith(word)))
    if (index >= 0) return index + 1
  }
  return monthStarts.find(([short]) => short === word)?.[1] ?? null
}

const two = (n: number) => String(n).padStart(2, '0')

function build(year: number, month: number, day: number): string | null {
  const date = `${year}-${two(month)}-${two(day)}`
  return year >= 2000 && year <= 2100 && isDate(date) ? date : null
}

type Match = { index: number; length: number; dates: string[] }

const patterns: [RegExp, (m: RegExpExecArray) => (string | null)[]][] = [
  // 2027-04-03, 2027/4/3, 2027.04.03
  [/(?<!\d)(20\d\d)([-/.])(\d{1,2})\2(\d{1,2})(?!\d)/g, (m) => [build(+m[1], +m[3], +m[4])]],
  // 2027年4月3日
  [/(20\d\d)\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g, (m) => [build(+m[1], +m[2], +m[3])]],
  // 03/04/2027 : jour d'abord, et mois d'abord si les deux sont possibles
  [
    /(?<!\d)(\d{1,2})([-/.])(\d{1,2})\2(20\d\d)(?!\d)/g,
    (m) => [build(+m[4], +m[3], +m[1]), build(+m[4], +m[1], +m[3])],
  ],
  // 3 aprile 2027, 03 Apr 2027, 1er avril 2027, 03-APR-2027
  [
    /(?<!\d)(\d{1,2})(?:st|nd|rd|th|er|º|°)?[\s-]*([a-z]{3,10})\.?,?[\s-]*(20\d\d)(?!\d)/g,
    (m) => {
      const month = monthNumber(m[2])
      return [month ? build(+m[3], month, +m[1]) : null]
    },
  ],
  // April 3, 2027
  [
    /(?<![a-z])([a-z]{3,10})\.?\s*(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d\d)(?!\d)/g,
    (m) => {
      const month = monthNumber(m[1])
      return [month ? build(+m[3], month, +m[2]) : null]
    },
  ],
]

export function findDates(text: string): FoundDate[] {
  const flat = text.replace(/\s+/g, ' ')
  // Minuscules sans accents, en gardant la même longueur pour retrouver l'extrait.
  const plain = Array.from(
    { length: flat.length },
    (_, i) => flat[i].normalize('NFD')[0].toLowerCase()[0],
  ).join('')

  const matches: Match[] = []
  for (const [pattern, read] of patterns) {
    for (const m of plain.matchAll(pattern)) {
      const dates = [...new Set(read(m).filter((d) => d !== null))]
      if (dates.length) matches.push({ index: m.index, length: m[0].length, dates })
    }
  }

  const found = new Map<string, FoundDate>()
  for (const match of matches.sort((a, b) => a.index - b.index)) {
    const excerpt = flat
      .slice(Math.max(0, match.index - 40), match.index + match.length + 15)
      .trim()
    for (const date of match.dates) {
      const ambiguous = match.dates.length > 1
      const known = found.get(date)
      // Une écriture sans ambiguïté de la même date l'emporte.
      if (!known || (known.ambiguous && !ambiguous)) found.set(date, { date, excerpt, ambiguous })
    }
  }
  return [...found.values()]
}

// Les dates du voyage d'abord : la date d'émission d'une confirmation est souvent avant.
export function rankDates(found: FoundDate[], start: string, end: string): FoundDate[] {
  const inside = (f: FoundDate) => f.date >= start && f.date <= end
  return [...found.filter(inside), ...found.filter((f) => !inside(f))]
}

// Dates préremplies : uniquement celles sans ambiguïté et pendant le voyage.
export function suggestDates(found: FoundDate[], start: string, end: string): string[] {
  return found
    .filter((f) => !f.ambiguous && f.date >= start && f.date <= end)
    .map((f) => f.date)
    .sort()
}
