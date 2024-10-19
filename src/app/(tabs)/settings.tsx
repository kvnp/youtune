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
    Switch,
} from 'react-native-paper'

import Locales from '@/src/lib/locales'
import { Color, Language } from '@/src/lib/types'
import { Colors, ScreenInfo, styles } from '@/src/lib/ui'
import { Languages } from '@/src/lib/utils'
import {
    selectSettings,
    useAppDispatch,
    useAppSelector,
    setSettings
} from '@/src/lib/redux'

const Settings = () => {
    const colorScheme = useColorScheme()
    const settings = useAppSelector(selectSettings)
    const dispatch = useAppDispatch()

    // const [message, setMessage] = useState({
    //     visible: false,
    //     content: ''
    // })

    const [display, setDisplay] = useState({
        color: false,
        language: false,
        theme: false,
    })

    const themeColors =
        Colors[
            settings.theme! === 'auto'
                ? (colorScheme ?? 'light')
                : settings.theme!
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
                                            dispatch(setSettings({language: 'auto'}))
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
                                                dispatch(setSettings({language: lang[0] as Language}));
                                                setDisplay({ ...display, language: false });
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
                                            dispatch(setSettings({ theme: 'auto' }))
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
                                            dispatch(setSettings({theme: 'light'}))
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
                                            dispatch(setSettings({theme: 'dark'}))
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
                                            settings.theme! === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme!
                                        ][settings.color!]?.primary
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
                                                    // @ts-ignore
                                                    dispatch(setSettings({color}));
                                                    setDisplay({ ...display, color: false });
                                                }}
                                            />
                                        </Surface>
                                    ))}
                                </Menu>
                            )}
                        />
                        <List.Item
                            title="Audio visualizer"
                            description="Visualize audio in the watch screen"
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon="animation"
                                    color={
                                        Colors[
                                            settings.theme! === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme!
                                        ][settings.color!]?.primary
                                    }
                                />
                            )}
                            right={(props) => (
                                <Switch
                                    value={settings.visualizer}
                                    onValueChange={value => { 
                                        dispatch(setSettings({ visualizer: value }));
                                    }}
                                />
                            )}
                        />
                    </List.Accordion>

                    <List.Accordion
                        id="2"
                        title="Communication"
                        left={(props) => <List.Icon {...props} icon="web" />}
                    >
                        <List.Item
                            title="Transmit Device Language"
                            description="Transmit device language when sending requests"
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon="earth"
                                    color={
                                        Colors[
                                            settings.theme! === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme!
                                        ][settings.color!]?.primary
                                    }
                                />
                            )}
                            right={_ => (
                                <Switch
                                    value={settings.visualizer}
                                    onValueChange={value => { 
                                        dispatch(setSettings({ transmitDeviceLanguage: value }));
                                    }}
                                />
                            )}
                        />
                        <List.Item
                            title="Proxy"
                            description="Use a proxy server to send requests"
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon="earth"
                                    color={
                                        Colors[
                                            settings.theme! === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme!
                                        ][settings.color!]?.primary
                                    }
                                />
                            )}
                            right={_ => (
                                <Switch
                                    value={settings.visualizer}
                                    onValueChange={value => {
                                        dispatch(setSettings({ proxy: value }));
                                    }}
                                />
                            )}
                        />
                        <List.Item
                            title="Satefy Mode"
                            description="Enable safety mode to filter explicit content"
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon="seatbelt"
                                    color={
                                        Colors[
                                            settings.theme! === 'auto'
                                                ? (colorScheme ?? 'light')
                                                : settings.theme!
                                        ][settings.color!]?.primary
                                    }
                                />
                            )}
                            right={_ => (
                                <Switch
                                    value={settings.visualizer}
                                    onValueChange={value => {
                                        dispatch(setSettings({ safetyMode: value }));
                                    }}
                                />
                            )}
                        />
                    </List.Accordion>
                </List.AccordionGroup>
            </Surface>

            {/* <Button
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
            </Snackbar> */}
        </Surface>
    )
}

export default Settings
