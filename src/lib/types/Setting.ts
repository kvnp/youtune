import { Color, Language } from '@/src/lib/types'

type Setting = {
    color?: Color
    theme?: 'light' | 'dark' | 'auto'
    language?: Language | 'auto'
    transmitDeviceLanguage?: boolean
    proxy?: boolean
    safetyMode?: boolean
    visualizer?: boolean

}

export default Setting
