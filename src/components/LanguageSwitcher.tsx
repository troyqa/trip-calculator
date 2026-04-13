import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'uk'

  return (
    <div
      className="inline-flex border-2 border-bauhaus-ink bg-white shadow-[4px_4px_0px_0px_#121212]"
      role="group"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        className={`cursor-pointer border-r-2 border-bauhaus-ink px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ease-out focus-visible:z-10 ${
          lang === 'uk' ? 'bg-bauhaus-yellow text-bauhaus-ink' : 'bg-white text-bauhaus-ink hover:bg-bauhaus-muted'
        }`}
        onClick={() => void i18n.changeLanguage('uk')}
        aria-pressed={lang === 'uk'}
      >
        {t('language.uk')}
      </button>
      <button
        type="button"
        className={`cursor-pointer px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ease-out focus-visible:z-10 ${
          lang === 'en' ? 'bg-bauhaus-yellow text-bauhaus-ink' : 'bg-white text-bauhaus-ink hover:bg-bauhaus-muted'
        }`}
        onClick={() => void i18n.changeLanguage('en')}
        aria-pressed={lang === 'en'}
      >
        {t('language.en')}
      </button>
    </div>
  )
}
