import { router } from 'expo-router'
import { Button, Surface } from 'react-native-paper'

import Locales from '@/src/lib/locales'
import { ScreenInfo, styles } from '@/src/lib/ui'

const Library = () => (
    <Surface style={styles.screen}>
        <ScreenInfo title="Library" path="src/app/(tabs)/library.tsx" />
    </Surface>
)

export default Library
