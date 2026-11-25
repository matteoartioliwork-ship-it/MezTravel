// Informations d'urgence. RÈGLE : uniquement des données lues sur une page officielle,
// avec sa source et la date de contrôle. Une donnée non vérifiée n'est pas ajoutée.

export const checkedOn = '2026-11-25'

export type Source = { name: string; url: string }

export type Phone = {
  label: PhoneLabel
  display: string
  dial: string // forme internationale, sauf pour les numéros courts
}

export type PhoneLabel =
  | 'police' | 'fireAmbulance' | 'coastGuard' | 'visitorHotline'
  | 'switchboard' | 'embassyEmergency' | 'helpline' | 'crisisUnit'

export type Office = {
  name: OfficeName
  address: string
  phones: Phone[]
  email?: string
  note?: OfficeNote
  source: Source
}

export type OfficeName = 'itEmbassyTokyo' | 'itConsulateOsaka' | 'chEmbassyTokyo' | 'chConsulateOsaka'
export type OfficeNote = 'itEmbassyNote' | 'itOsakaNote' | 'chEmbassyNote' | 'chOsakaNote'

export type CountryCard = {
  localNumbers: (Phone & { source: Source })[]
  italy: Office[]
  switzerland: Office[]
}

const jnto = { name: 'JNTO (japan.travel)', url: 'https://www.japan.travel/en/plan/hotline/' }
const swissContacts = {
  name: 'EDA / FDFA',
  url: 'https://www.schweiz-japan.eda.admin.ch/en/swiss-representations-contacts',
}

export const countryCards: Record<string, CountryCard> = {
  JP: {
    localNumbers: [
      { label: 'police', display: '110', dial: '110', source: jnto },
      { label: 'fireAmbulance', display: '119', dial: '119', source: jnto },
      {
        label: 'coastGuard',
        display: '118',
        dial: '118',
        source: { name: '海上保安庁 (Japan Coast Guard)', url: 'https://www.kaiho.mlit.go.jp/doc/tel118.html' },
      },
      { label: 'visitorHotline', display: '+81 50 3816 2787', dial: '+815038162787', source: jnto },
    ],
    italy: [
      {
        name: 'itEmbassyTokyo',
        address: '2-5-4 Mita, Minato-ku, Tokyo 108-0073',
        phones: [
          { label: 'embassyEmergency', display: '+81 90 3908 1006', dial: '+819039081006' },
          { label: 'switchboard', display: '+81 3 3453 5291', dial: '+81334535291' },
        ],
        email: 'ambasciata.tokyo@esteri.it',
        note: 'itEmbassyNote',
        source: {
          name: 'ambtokyo.esteri.it',
          url: 'https://ambtokyo.esteri.it/it/chi-siamo/numeri-di-emergenza/',
        },
      },
      {
        name: 'itConsulateOsaka',
        address: 'Nakanoshima Festival Tower 17F, 2-3-18 Nakanoshima, Kita-ku, Osaka 530-0005',
        phones: [{ label: 'switchboard', display: '+81 6 4706 5820', dial: '+81647065820' }],
        email: 'segreteria.osaka@esteri.it',
        note: 'itOsakaNote',
        source: { name: 'consosaka.esteri.it', url: 'https://consosaka.esteri.it/consolato_osaka/it' },
      },
    ],
    switzerland: [
      {
        name: 'chEmbassyTokyo',
        address: '5-9-12 Minami-Azabu, Minato-ku, Tokyo 106-8589',
        phones: [{ label: 'switchboard', display: '+81 3 5449 8400', dial: '+81354498400' }],
        email: 'tokyo@eda.admin.ch',
        note: 'chEmbassyNote',
        source: swissContacts,
      },
      {
        name: 'chConsulateOsaka',
        address: 'Umeda Shimmichi Bldg. 1F, 1-1-5 Dojima, Kita-ku, Osaka 530-0003',
        phones: [{ label: 'switchboard', display: '+81 6 7777 2546', dial: '+81677772546' }],
        email: 'tokyo.kanzlei@eda.admin.ch',
        note: 'chOsakaNote',
        source: swissContacts,
      },
    ],
  },
}

// Valables depuis n'importe quel pays.
export const worldwide = {
  italy: {
    phone: { label: 'crisisUnit', display: '+39 06 36225', dial: '+390636225' } as Phone,
    source: {
      name: 'ambtokyo.esteri.it',
      url: 'https://ambtokyo.esteri.it/it/chi-siamo/numeri-di-emergenza/',
    },
    links: [{ name: 'Viaggiare Sicuri', url: 'https://www.viaggiaresicuri.it/' }],
  },
  switzerland: {
    phones: [
      { label: 'helpline', display: '+41 58 465 33 33', dial: '+41584653333' },
      { label: 'helpline', display: '+41 800 24 7 365', dial: '+41800247365' },
    ] as Phone[],
    email: 'helpline@eda.admin.ch',
    source: {
      name: 'EDA / FDFA',
      url: 'https://www.schweiz-japan.eda.admin.ch/en/contact-helpline-fdfa',
    },
    links: [
      {
        name: 'EDA / FDFA – Swiss representations abroad',
        url: 'https://www.eda.admin.ch/eda/en/fdfa/representations-and-travel-advice/schweizer-vertretungen-im-ausland.html',
      },
    ],
  },
}

// Codes de pays ISO 3166-1 ; les noms sont fournis par le téléphone dans la langue choisie.
export const countryCodes = (
  'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG ' +
  'CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH ' +
  'GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW ' +
  'KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA ' +
  'NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK ' +
  'SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN ' +
  'VU WS XK YE ZA ZM ZW'
).split(' ')
