import { useEffect, useState } from 'react'

export const languages = ['it', 'en', 'fr'] as const
export type Language = (typeof languages)[number]

// L'italien sert de référence : TypeScript signale toute clé manquante en en/fr.
const it = {
  tagline: 'Il tuo viaggio, giorno per giorno',
  languageLabel: 'Lingua',

  myTrips: 'I miei viaggi',
  noTrips: 'Non hai ancora nessun viaggio. Creane uno per iniziare.',
  newTrip: 'Nuovo viaggio',
  editTrip: 'Modifica viaggio',
  deleteTrip: 'Elimina viaggio',
  confirmDeleteTrip: 'Eliminare questo viaggio con tutto il suo programma? Non si può annullare.',
  tripName: 'Nome del viaggio',
  destination: 'Destinazione',
  startDate: 'Data di partenza',
  endDate: 'Data di ritorno',
  datesMissing: 'Scegli entrambe le date.',
  datesOrder: 'Il ritorno non può essere prima della partenza.',
  datesTooLong: 'Un viaggio può durare al massimo 366 giorni.',
  nameRequired: 'Scrivi un nome.',
  confirmHide:
    'Con le nuove date alcune voci del programma restano fuori dal viaggio. Non vengono cancellate: ricompaiono se rimetti quei giorni. Continuare? Voci nascoste:',

  day: 'Giorno',
  today: 'Oggi',
  activities: 'Programma',
  activitiesCount: 'Attività',
  toBringCount: 'Da preparare',
  noActivities: 'Nessuna attività per questo giorno.',
  addActivity: 'Aggiungi attività',
  editActivity: 'Modifica attività',
  confirmDeleteActivity: 'Eliminare questa attività?',
  time: 'Orario (facoltativo)',
  title: 'Cosa si fa',
  titleRequired: 'Scrivi cosa si fa.',
  place: 'Luogo (facoltativo)',
  notes: 'Note (facoltative)',

  toBring: 'Cosa serve oggi',
  toBringPlaceholder: 'Es. passaporto',
  noItems: 'Niente da preparare per ora.',

  add: 'Aggiungi',
  save: 'Salva',
  cancel: 'Annulla',
  edit: 'Modifica',
  remove: 'Elimina',
  back: 'Indietro',
  previousDay: 'Giorno precedente',
  nextDay: 'Giorno successivo',
  notFound: 'Questa pagina non esiste più.',

  backupTitle: 'Copia di sicurezza',
  backupText:
    'I viaggi sono salvati solo su questo dispositivo. Salva ogni tanto una copia in un file, per esempio nell’app File.',
  backupSave: 'Salva una copia',
  backupRestore: 'Ripristina da una copia',
  backupInvalid: 'Questo file non è una copia valida di MezTravel.',
  backupConfirm:
    'I viaggi della copia verranno aggiunti. Quelli già presenti con la stessa identità saranno sostituiti dalla versione della copia, anche se è più vecchia. Continuare? Viaggi nella copia:',
  backupRestored: 'Copia ripristinata.',

  damaged:
    'I dati salvati non si riescono a leggere. Per non cancellarli, l’app non salva nulla. Salva il file qui sotto e chiedi aiuto.',
  damagedDownload: 'Salva i dati illeggibili',
  saveFailed:
    'Attenzione: il dispositivo non riesce a salvare. Le ultime modifiche andranno perse se chiudi l’app. Salva subito una copia di sicurezza.',

  installTitle: 'Installa su iPhone',
  installText: 'Apri questa pagina in Safari, tocca Condividi, poi «Aggiungi alla schermata Home».',
}

export type Dictionary = typeof it

const en: Dictionary = {
  tagline: 'Your trip, day by day',
  languageLabel: 'Language',

  myTrips: 'My trips',
  noTrips: 'You have no trips yet. Create one to get started.',
  newTrip: 'New trip',
  editTrip: 'Edit trip',
  deleteTrip: 'Delete trip',
  confirmDeleteTrip: 'Delete this trip and its whole plan? This cannot be undone.',
  tripName: 'Trip name',
  destination: 'Destination',
  startDate: 'Departure date',
  endDate: 'Return date',
  datesMissing: 'Choose both dates.',
  datesOrder: 'The return cannot be before the departure.',
  datesTooLong: 'A trip can last 366 days at most.',
  nameRequired: 'Enter a name.',
  confirmHide:
    'With the new dates some entries fall outside the trip. They are not deleted: they come back if you restore those days. Continue? Hidden entries:',

  day: 'Day',
  today: 'Today',
  activities: 'Plan',
  activitiesCount: 'Activities',
  toBringCount: 'To prepare',
  noActivities: 'No activities for this day.',
  addActivity: 'Add activity',
  editActivity: 'Edit activity',
  confirmDeleteActivity: 'Delete this activity?',
  time: 'Time (optional)',
  title: 'What you will do',
  titleRequired: 'Enter what you will do.',
  place: 'Place (optional)',
  notes: 'Notes (optional)',

  toBring: 'What you need today',
  toBringPlaceholder: 'E.g. passport',
  noItems: 'Nothing to prepare for now.',

  add: 'Add',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  remove: 'Delete',
  back: 'Back',
  previousDay: 'Previous day',
  nextDay: 'Next day',
  notFound: 'This page no longer exists.',

  backupTitle: 'Backup',
  backupText:
    'Trips are saved only on this device. Save a copy to a file now and then, for example in the Files app.',
  backupSave: 'Save a backup',
  backupRestore: 'Restore from a backup',
  backupInvalid: 'This file is not a valid MezTravel backup.',
  backupConfirm:
    'The trips in the backup will be added. Existing trips with the same identity will be replaced by the backup version, even if it is older. Continue? Trips in the backup:',
  backupRestored: 'Backup restored.',

  damaged:
    'The saved data cannot be read. To avoid erasing it, the app saves nothing. Save the file below and ask for help.',
  damagedDownload: 'Save the unreadable data',
  saveFailed:
    'Warning: this device cannot save. Your latest changes will be lost if you close the app. Save a backup now.',

  installTitle: 'Install on iPhone',
  installText: 'Open this page in Safari, tap Share, then “Add to Home Screen”.',
}

const fr: Dictionary = {
  tagline: 'Votre voyage, jour après jour',
  languageLabel: 'Langue',

  myTrips: 'Mes voyages',
  noTrips: 'Vous n’avez pas encore de voyage. Créez-en un pour commencer.',
  newTrip: 'Nouveau voyage',
  editTrip: 'Modifier le voyage',
  deleteTrip: 'Supprimer le voyage',
  confirmDeleteTrip: 'Supprimer ce voyage et tout son programme ? Action irréversible.',
  tripName: 'Nom du voyage',
  destination: 'Destination',
  startDate: 'Date de départ',
  endDate: 'Date de retour',
  datesMissing: 'Choisissez les deux dates.',
  datesOrder: 'Le retour ne peut pas précéder le départ.',
  datesTooLong: 'Un voyage dure au maximum 366 jours.',
  nameRequired: 'Saisissez un nom.',
  confirmHide:
    'Avec les nouvelles dates, certains éléments sortent du voyage. Ils ne sont pas effacés : ils réapparaissent si vous remettez ces jours. Continuer ? Éléments masqués :',

  day: 'Jour',
  today: 'Aujourd’hui',
  activities: 'Programme',
  activitiesCount: 'Activités',
  toBringCount: 'À préparer',
  noActivities: 'Aucune activité ce jour-là.',
  addActivity: 'Ajouter une activité',
  editActivity: 'Modifier l’activité',
  confirmDeleteActivity: 'Supprimer cette activité ?',
  time: 'Heure (facultative)',
  title: 'Ce que vous faites',
  titleRequired: 'Indiquez ce que vous faites.',
  place: 'Lieu (facultatif)',
  notes: 'Notes (facultatives)',

  toBring: 'Ce qu’il faut ce jour-là',
  toBringPlaceholder: 'Ex. passeport',
  noItems: 'Rien à préparer pour l’instant.',

  add: 'Ajouter',
  save: 'Enregistrer',
  cancel: 'Annuler',
  edit: 'Modifier',
  remove: 'Supprimer',
  back: 'Retour',
  previousDay: 'Jour précédent',
  nextDay: 'Jour suivant',
  notFound: 'Cette page n’existe plus.',

  backupTitle: 'Copie de sécurité',
  backupText:
    'Les voyages sont enregistrés uniquement sur cet appareil. Enregistrez de temps en temps une copie dans un fichier, par exemple dans l’app Fichiers.',
  backupSave: 'Enregistrer une copie',
  backupRestore: 'Restaurer une copie',
  backupInvalid: 'Ce fichier n’est pas une copie MezTravel valide.',
  backupConfirm:
    'Les voyages de la copie seront ajoutés. Ceux qui existent déjà avec la même identité seront remplacés par la version de la copie, même plus ancienne. Continuer ? Voyages dans la copie :',
  backupRestored: 'Copie restaurée.',

  damaged:
    'Les données enregistrées sont illisibles. Pour ne pas les effacer, l’app n’enregistre rien. Enregistrez le fichier ci-dessous et demandez de l’aide.',
  damagedDownload: 'Enregistrer les données illisibles',
  saveFailed:
    'Attention : l’appareil n’arrive pas à enregistrer. Les dernières modifications seront perdues si vous fermez l’app. Faites une copie de sécurité maintenant.',

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

export function formatDate(date: string, language: Language, long = false): string {
  return new Intl.DateTimeFormat(language, {
    weekday: long ? 'long' : 'short',
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: long ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
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
