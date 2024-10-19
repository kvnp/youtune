/**
 * Styles
 */

import { StyleSheet } from 'react-native'

import Colors from '@/src/lib/ui/styles/colors'
import Themes from '@/src/lib/ui/styles/themes'

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        gap: 16,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export { Colors, Themes, styles }
