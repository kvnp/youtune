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
        paddingTop: 32,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export { Colors, Themes, styles }
