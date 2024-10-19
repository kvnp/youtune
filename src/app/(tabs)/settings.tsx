import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import {
    Surface,
    List,
    Menu,
    Button,
    IconButton,
    Snackbar,
    Icon,
} from 'react-native-paper'

import Locales from '@/src/lib/locales'
import { Color, Language } from '@/src/lib/types'
import { Colors, ScreenInfo, styles } from '@/src/lib/ui'
import { Languages } from '@/src/lib/utils'
import {
    selectSettings,
    setTheme,
    setColor,
    setLanguage,
    useAppDispatch,
    useAppSelector,
    setSettings
} from '@/src/lib/redux'

const Settings = () => {
    const colorScheme = useColorScheme()
    const settings = useAppSelector(selectSettings)
    const dispatch = useAppDispatch()

    const [message, setMessage] = useState({
        visible: false,
        content: ''
    })

    const [display, setDisplay] = useState({
        color: false,
        language: false,
        theme: false,
    })

    const themeColors =
        Colors[
        settings.theme === 'auto' ? (colorScheme ?? 'light') : settings.theme
        ]

    return (
        <Surface style={{ flex: 1 }}>
            <Surface elevation={0}>
                <List.AccordionGroup>
                    <List.Accordion
                        id="1"
                        title={Locales.t('appearance')}
                        left={(props) => <List.Icon {...props} icon="palette" />}
                    >
                        <List.Item
                            title={Locales.t('language')}
                            description={Locales.t('changeLanguage')}
                            left={(props) => <List.Icon {...props} icon="translate" />}
                            right={(props) => (
                                <Menu
                                    visible={display.language}
                                    onDismiss={() =>
                                        setDisplay({ ...display, language: false })
                                    }
                                    anchor={
                                        <IconButton
                                            {...props}
                                            icon="pencil"
                                            onPress={() =>
                                                setDisplay({ ...display, language: true })
                                            }
                                        />
                                    }
                                >
                                    <Menu.Item
                                        title="System"
                                        trailingIcon={
                                            settings.language === 'auto' ? 'check' : undefined
                                        }
                                        onPress={() => {
                                            dispatch(setLanguage('auto'))
                                            setDisplay({ ...display, language: false })
                                        }}
                                    />
                                    {Object.entries(Languages).map((lang) => (
                                        <Menu.Item
                                            key={lang[0]}
                                            title={`${lang[1].name} / ${lang[1].nativeName}`}
                                            trailingIcon={
                                                settings.language === lang[0] ? 'check' : undefined
                                            }
                                            onPress={() => {
                                                dispatch(setLanguage(lang[0] as Language))
                                                setDisplay({ ...display, language: false })
                                            }}
                                        />
                                    ))}
                                </Menu>
                            )}
                        />
                        <List.Item
                            title={Locales.t('mode')}
                            description={Locales.t('changeMode')}
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon={
                                        settings.theme === 'auto'
                                            ? 'theme-light-dark'
                                            : settings.theme === 'light'
                                                ? 'weather-sunny'
                                                : 'weather-night'
                                    }
                                />
                            )}
                            right={(props) => (
                                <Menu
                                    visible={display.theme}
                                    onDismiss={() => setDisplay({ ...display, theme: false })}
                                    anchor={
                                        <IconButton
                                            {...props}
                                            icon="pencil"
                                            onPress={() => setDisplay({ ...display, theme: true })}
                                        />
                                    }
                                >
                                    <Menu.Item
                                        title={Locales.t('system')}
                                        leadingIcon="theme-light-dark"
                                        trailingIcon={
                                            settings.theme === 'auto' ? 'check' : undefined
                                        }
                                        onPress={() => {
                                            dispatch(setTheme('auto'))
                                            setDisplay({ ...display, theme: false })
                                        }}
                                    />
                                    <Menu.Item
                                        title={Locales.t('lightMode')}
                                        leadingIcon="weather-sunny"
                                        trailingIcon={
                                            settings.theme === 'light' ? 'check' : undefined
                                        }
                                        onPress={() => {
                                            dispatch(setTheme('light'))
                                            setDisplay({ ...display, theme: false })
                                        }}
                                    />
                                    <Menu.Item
                                        title={Locales.t('darkMode')}
                                        leadingIcon="weather-night"
                                        trailingIcon={
                                            settings.theme === 'dark' ? 'check' : undefined
                                        }
                                        onPress={() => {
                                            dispatch(setTheme('dark'))
                                            setDisplay({ ...display, theme: false })
                                        }}
                                    />
                                </Menu>
                            )}
                        />
                        <List.Item
                            title={Locales.t('color')}
                            description={Locales.t('changeColor')}
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon="palette-swatch-variant"
                                    color={
                                        Colors[
                                            settings.theme === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme
                                        ][settings.color]?.primary
                                    }
                                />
                            )}
                            right={(props) => (
                                <Menu
                                    visible={display.color}
                                    onDismiss={() => setDisplay({ ...display, color: false })}
                                    anchor={
                                        <IconButton
                                            {...props}
                                            icon="pencil"
                                            onPress={() => setDisplay({ ...display, color: true })}
                                        />
                                    }
                                >
                                    {Object.keys(Colors.light).map((color) => (
                                        <Surface
                                            key={color}
                                            elevation={0}
                                            style={{
                                                width: '100%',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Surface
                                                elevation={0}
                                                style={{
                                                    padding: 4,
                                                    marginLeft: 8,
                                                    borderRadius: 16,
                                                    backgroundColor:
                                                        color !== settings.color
                                                            ? undefined
                                                            : themeColors[color]?.primary,
                                                }}
                                            >
                                                <Icon
                                                    size={24}
                                                    source="palette"
                                                    color={
                                                        color !== settings.color
                                                            ? themeColors[color as Color]?.primary
                                                            : themeColors[color].onPrimary
                                                    }
                                                />
                                            </Surface>

                                            <Menu.Item
                                                key={color}
                                                title={Locales.t(color)}
                                                onPress={() => {
                                                    dispatch(setColor(color as Color))
                                                    setDisplay({ ...display, color: false })
                                                }}
                                            />
                                        </Surface>
                                    ))}
                                </Menu>
                            )}
                        />
                    </List.Accordion>
                </List.AccordionGroup>
            </Surface>

            <Surface elevation={0} style={styles.screen}>
                <ScreenInfo
                    title={Locales.t('titleSettings')}
                    path="app/(tabs)/settings.tsx"
                />
            </Surface>

            <Button
                mode="contained"
                style={{ margin: 16 }}
                onPress={() => {
                    dispatch(setSettings(settings))
                    setMessage({
                        visible: true,
                        content: Locales.t('saved'),
                    })
                }}
            >
                {Locales.t('save')}
            </Button>

            <Snackbar
                visible={message.visible}
                onDismiss={() => setMessage({ ...message, visible: false })}
                onIconPress={() => setMessage({ ...message, visible: false })}
            >
                {message.content}
            </Snackbar>
        </Surface>
    )
}

export default Settings
