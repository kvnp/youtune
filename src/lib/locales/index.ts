/**
 * Locales
 */

import { I18n } from 'i18n-js'

import Arabic from '@/src/lib/locales/ar'
import English from '@/src/lib/locales/en'
import German from '@/src/lib/locales/de'
import Turkish from '@/src/lib/locales/tr'

const Locales = new I18n({
    ar: Arabic,
    en: English,
    de: German,
    tr: Turkish,
})

Locales.enableFallback = true

export default Locales
