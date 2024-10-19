import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Tabs, router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Appbar, Menu, Tooltip } from 'react-native-paper'

import Locales from '@/src/lib/locales'
import { TabBar, TabsHeader } from '@/src/lib/ui'
import UI from '@/src/legacy/services/ui/UI'
import Music from '@/src/legacy/services/music/Music'

const TabLayout = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        UI.initialize();
        Music.initialize();
    }, []);

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                tabBarHideOnKeyboard: true,
                header: (props) => <TabsHeader
                    navProps={props}
                    children={undefined}
                />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: Locales.t('titleHome'),
                    headerRight: () => (
                        <>
                            <Tooltip title={Locales.t('search')}>
                                <Appbar.Action
                                    icon="magnify"
                                    onPress={() => router.push('/search')}
                                />
                            </Tooltip>
                            <Menu
                                statusBarHeight={48}
                                visible={visible}
                                onDismiss={() => setVisible(false)}
                                anchor={
                                    <Tooltip title={Locales.t('options')}>
                                        <Appbar.Action
                                            icon="dots-vertical"
                                            onPress={() => setVisible(true)}
                                        />
                                    </Tooltip>
                                }
                            >
                                <Menu.Item
                                    title={Locales.t('titleSettings')}
                                    leadingIcon="cog"
                                    onPress={() => router.push('/(tabs)/settings')}
                                />
                            </Menu>
                        </>
                    ),
                    tabBarIcon: (props) => (
                        <MaterialCommunityIcons
                            {...props}
                            size={24}
                            name={
                                props.focused
                                    ? 'home'
                                    : 'home-outline'
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: Locales.t('profile'),
                    headerRight: () => (
                        <>
                            <Tooltip title={Locales.t('search')}>
                                <Appbar.Action
                                    icon="magnify"
                                    onPress={() => router.push('/search')}
                                />
                            </Tooltip>
                            <Tooltip title={Locales.t('titleSettings')}>
                                <Appbar.Action
                                    icon="cog"
                                    onPress={() => router.push('/(tabs)/settings')}
                                />
                            </Tooltip>
                        </>
                    ),
                    tabBarIcon: (props) => (
                        <MaterialCommunityIcons
                            {...props}
                            size={24}
                            name={props.focused
                                ? 'account'
                                : 'account-outline'
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: Locales.t('titleSettings'),
                    headerRight: () => (
                        <Tooltip title={Locales.t('drawerNav')}>
                            <Appbar.Action
                                icon="gesture-swipe"
                                onPress={() => router.push('/drawer')}
                            />
                        </Tooltip>
                    ),
                    tabBarIcon: (props) => (
                        <MaterialCommunityIcons
                            {...props}
                            size={24}
                            name={props.focused
                                ? 'cog'
                                : 'cog-outline'
                            }
                        />
                    ),
                }}
            />
        </Tabs>
    )
}

export default TabLayout
