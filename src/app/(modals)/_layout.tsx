import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
    useFonts,
    JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono'
import { NotoSans_400Regular } from '@expo-google-fonts/noto-sans'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/src/lib/redux'

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
    return <Stack
        screenOptions={{
            animation: 'slide_from_bottom',
        }}
    >
        <Stack.Screen
            name="watch"
            options={{
                title: "Watch",
                headerShown: false,
            }}
        />
        <Stack.Screen
            name="channel"
            options={{
                title: "Channel",
            }}
        />
        <Stack.Screen
            name="playlist"
            options={{
                title: "Playlist",
            }}
        />
    </Stack>
}

export default RootLayout
