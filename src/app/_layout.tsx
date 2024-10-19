import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
    useFonts,
    JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono'
import { NotoSans_400Regular } from '@expo-google-fonts/noto-sans'
import * as Localization from 'expo-localization'
import { Slot, SplashScreen, Stack, useRootNavigationState } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { Provider } from 'react-redux'
import Locales from '@/src/lib/locales'
import { StackHeader, Themes } from '@/src/lib/ui'
import { store } from '@/src/lib/redux'

import { useAppSelector } from '@/src/lib/redux'
import { selectSettings } from '@/src/lib/redux/settingsSlice'

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
    const [loaded, error] = useFonts({
        NotoSans_400Regular,
        JetBrainsMono_400Regular,
        ...MaterialCommunityIcons.font,
    })

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error
    }, [error])

    useEffect(() => {
        if (loaded)
            SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded)
        return null;

    return <Provider store={store}>
        <RootLayoutNav />
    </Provider>
}

const RootLayoutNav = () => {
    const colorScheme = useColorScheme();
    const {language, theme, color} = useAppSelector(selectSettings);

    useEffect(() => {
        if (language === 'auto')
            Locales.locale = Localization.getLocales()[0].languageCode ?? 'en'
        else
            Locales.locale = language
    }, [language])

    return <PaperProvider
        theme={
            Themes[
                theme === 'auto'
                    ? (colorScheme ?? 'dark')
                    : theme
            ][color]
        }
    >
        <Stack
            screenOptions={{
                animation: 'slide_from_bottom',
                header: (props) => (
                    <StackHeader
                        navProps={props}
                        children={undefined}
                    />
                ),
            }}
        >
            <Stack.Screen
                name="search"
                options={{
                    title: Locales.t('search')
                }}
            />
            <Stack.Screen
                name="(modals)"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    </PaperProvider>
}

export default RootLayout
