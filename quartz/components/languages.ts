import generated from '../i18n.generated.json'
import base from '../site-settings.json'
import ar from '../../i18n/settings.ar.json'
import en from '../../i18n/settings.en.json'
export function language(slug: string) { return /^(ar|en)(\/|$)/.exec(slug)?.[1] || 'fa' }
type Settings = Omit<typeof base, 'footer'> & { footer: Omit<typeof base.footer, 'links'> & { links: {label:string;href:string}[] } }
export function languageSettings(slug: string): Settings { const l=language(slug); return (l==='ar'?ar:l==='en'?en:base) as Settings }
export const enabledLanguages = generated.enabled
export const languageLabels: Record<string,string> = {fa:'فارسی',ar:'العربية',en:'English'}
