import { languages, useLanguage } from './i18n'

export default function App() {
  const { language, setLanguage, t } = useLanguage()

  const features = [
    t.featureItinerary,
    t.featureMap,
    t.featureBookings,
    t.featureMoney,
    t.featureDiary,
    t.featureShare,
    t.featureTranslate,
    t.featureCamera,
  ]

  return (
    <>
      <header>
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width="56" height="56" />
          <div>
            <h1>MezTravel</h1>
            <p>{t.tagline}</p>
          </div>
        </div>
        <div className="languages" role="group" aria-label={t.languageLabel}>
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={code === language}
              onClick={() => setLanguage(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main>
        <section className="card">
          <h2>{t.welcomeTitle}</h2>
          <p>{t.welcomeText}</p>
        </section>

        <section className="card">
          <h2>{t.comingTitle}</h2>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>{t.installTitle}</h2>
          <p>{t.installText}</p>
        </section>
      </main>
    </>
  )
}
