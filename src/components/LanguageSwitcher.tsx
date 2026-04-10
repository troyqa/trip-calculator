import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <ToggleButtonGroup
      size="small"
      value={i18n.language.startsWith('en') ? 'en' : 'uk'}
      exclusive
      onChange={(_, v) => {
        if (v) void i18n.changeLanguage(v)
      }}
      aria-label={t('language.label')}
    >
      <ToggleButton value="uk">{t('language.uk')}</ToggleButton>
      <ToggleButton value="en">{t('language.en')}</ToggleButton>
    </ToggleButtonGroup>
  )
}
