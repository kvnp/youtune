import { Color, Language } from '@/src/lib/types'

type Setting = {
    color: Color
    theme: 'light' | 'dark' | 'auto'
    language: Language | 'auto'
}

export default Setting
