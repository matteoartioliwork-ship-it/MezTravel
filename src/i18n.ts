import { useEffect, useState } from 'react'

export const languages = ['it', 'en', 'fr'] as const
export type Language = (typeof languages)[number]

// L'italien sert de référence : TypeScript signale toute clé manquante en en/fr.
const it = {
  tagline: 'Il tuo viaggio, giorno per giorno',
  languageLabel: 'Lingua',
  welcomeTitle: 'Benvenuto in MezTravel',
  welcomeText: 'Questa è la prima versione. Le funzioni arriveranno una fase alla volta.',
  comingTitle: 'In arrivo',
  featureItinerary: 'Itinerario giorno per giorno',
  featureMap: 'Mappa e meteo',
  featureBookings: 'Prenotazioni e promemoria',
  featureMoney: 'Valute e spese di gruppo',
  featureDiary: 'Diario ed emergenze',
  featureShare: 'Condivisione del viaggio',
  featureTranslate: 'Traduttore di testi',
  featureCamera: 'Traduzione con la fotocamera',
  installTitle: 'Installa su iPhone',
  installText: 'Apri questa pagina in Safari, tocca Condividi, poi «Aggiungi alla schermata Home».',
}

type Dictionary = typeof it

const en: Dictionary = {
  tagline: 'Your trip, day by day',
  languageLabel: 'Language',
  welcomeTitle: 'Welcome to MezTravel',
  welcomeText: 'This is the first version. Features will arrive one phase at a time.',
  comingTitle: 'Coming soon',
  featureItinerary: 'Day-by-day itinerary',
  featureMap: 'Map and weather',
  featureBookings: 'Bookings and reminders',
  featureMoney: 'Currencies and shared expenses',
  featureDiary: 'Journal and emergencies',
  featureShare: 'Trip sharing',
  featureTranslate: 'Text translator',
  featureCamera: 'Camera translation',
  installTitle: 'Install on iPhone',
  installText: 'Open this page in Safari, tap Share, then “Add to Home Screen”.',
}

const fr: Dictionary = {
  tagline: 'Votre voyage, jour après jour',
  languageLabel: 'Langue',
  welcomeTitle: 'Bienvenue dans MezTravel',
  welcomeText: 'Ceci est la première version. Les fonctions arriveront une phase à la fois.',
  comingTitle: 'Bientôt disponible',
  featureItinerary: 'Itinéraire jour par jour',
  featureMap: 'Carte et météo',
  featureBookings: 'Réservations et rappels',
  featureMoney: 'Devises et dépenses partagées',
  featureDiary: 'Journal et urgences',
  featureShare: 'Partage du voyage',
  featureTranslate: 'Traducteur de texte',
  featureCamera: 'Traduction avec l’appareil photo',
  installTitle: 'Installer sur iPhone',
  installText: 'Ouvrez cette page dans Safari, touchez Partager, puis « Sur l’écran d’accueil ».',
}

const dictionaries: Record<Language, Dictionary> = { it, en, fr }

const storageKey = 'meztravel.language'

function isLanguage(value: unknown): value is Language {
  return languages.includes(value as Language)
}

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey)
    if (isLanguage(saved)) return saved
  } catch {
    // Stockage indisponible : on utilise la langue du téléphone.
  }
  const phone = navigator.language.slice(0, 2)
  return isLanguage(phone) ? phone : 'it'
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(storageKey, language)
    } catch {
      // Le choix ne sera pas mémorisé, l'app reste utilisable.
    }
  }, [language])

  return { language, setLanguage, t: dictionaries[language] }
}
