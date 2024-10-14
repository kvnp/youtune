import { useEffect, useState } from 'react';

import {
    StyleSheet,
    Switch,
    Text,
    Platform,
    Linking,
    View,
    FlatList
} from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@react-navigation/native';

import Settings from '../../services/device/Settings';

const host = Platform.OS == "web"
    ? window.location.hostname.replace("-", "‑") // Unicode NON-BREAKING HYPHEN (U+2011)
    : "youtune.kvnp.eu";

export default function SettingsTab() {
    const [initialized, setInitialized] = useState(Settings.initialized);
    const [transmitLanguage, setTransmitLanguage] = useState(Settings.Values.transmitLanguage);
    const [proxyYTM, setProxyYTM] = useState(Settings.Values.proxyYTM);
    const [proxyYTMM, setProxyYTMM] = useState(Settings.Values.proxyYTMM);
    const [safetyMode, setSafetyMode] = useState(Settings.Values.safetyMode);
    const [darkMode, setDarkMode] = useState(Settings.Values.darkMode);
    const [visualizer, setVisualizer] = useState(Settings.Values.visualizer);
    const { colors } = useTheme();

    useEffect(() => {
        const settingsListener = Settings.addListener(
            Settings.EVENT_SETTINGS,
            values => {
                if (!initialized) setInitialized(true);
                setTransmitLanguage(values.transmitLanguage);
                setProxyYTM(values.proxyYTM);
                setProxyYTMM(values.proxyYTMM);
                setSafetyMode(values.safetyMode);
                setDarkMode(values.darkMode);
                setVisualizer(values.visualizer);
            }
        );
                
        return () => settingsListener.remove();
    }, []);

    const openRepo = () => {
        const url = "https://github.com/kvnp/youtune-reactnative";
        if (Platform.OS == "web")
            window.open(url, "_blank");
        else
            Linking.openURL(url);
    };

    const toggleLanguage = boolean => {
        setTransmitLanguage(boolean);
        Settings.enableLanguageTransmission(boolean);
    };
    
    const toggleProxy = boolean => {
        setProxyYTM(boolean);
        Settings.enableProxy(boolean);
    };

    const toggleProxyM = boolean => {
        setProxyYTMM(boolean);
        Settings.enableProxyM(boolean);
    };

    const toggleSafetyMode = boolean => {
        setSafetyMode(boolean);
        Settings.enableSafetyMode(boolean);
    };

    const toggleDarkMode = boolean => {
        setDarkMode(boolean);
        Settings.enableDarkMode(boolean);
    };

    const toggleAudioVisualizer = boolean => {
        setVisualizer(boolean);
        Settings.enableAudioVisualizer(boolean);
        if (boolean) toggleProxyM(boolean);
    }

    const drawItem = ({item}) => {
        const func = item.function;
        const icon = item.icon;
        const desc = item.description;
        const useSwitch = item.switch;

        const disabled = item?.override && Platform.OS == "web"
            ? item.override.web.disabled
            : false;
        
        const state = item?.override && Platform.OS == "web"
            ? item.override.web.state
            : item.state;

        return <TouchableRipple
            borderless={true}
            disabled={initialized ? disabled : true}
            style={{
                marginHorizontal: 5,
                borderRadius: 5,
                marginBottom: 10,
                height: 70,
                backgroundColor: colors.card,
                flexDirection: 'row',
            }}

            key={icon}
            onPress={() => disabled ? null : func(!state)}
            rippleColor={colors.primary}
        >
            <View style={{
                flex: 1,
                flexDirection: "row",
                alignSelf: "center",
                alignItems: "center",
                paddingHorizontal: 20
            }}>
                <MaterialIcons
                    name={icon}
                    color={colors.text}
                    size={30}
                />

                <Text style={{
                    flex: 1,
                    flexWrap: "wrap",
                    color: colors.text,
                    marginHorizontal: 10
                }}>
                    {desc}
                </Text>
                
                {
                    useSwitch
                        ? <Switch
                            trackColor={{ false: "gray", true: colors.primary }}
                            thumbColor="darkgray"
                            onValueChange={disabled ? null : func}
                            value={initialized ? state : false}
                            disabled={initialized ? disabled : true}
                        />

                        : <MaterialIcons
                            name="launch"
                            color={colors.text}
                            size={30}
                        />
                }
            </View>
        </TouchableRipple>;
    }

    const items = [
        {
            icon: "code",
            description: "View project on Github",
            state: true,
            function: openRepo,
            switch: false
        },

        {
            icon: "language",
            description: "Transmit device language",
            state: transmitLanguage,
            function: toggleLanguage,
            switch: true
        },

        {
            icon: "public",
            description: "Proxy search and browse requests over " + host,
            state: proxyYTM,
            function: toggleProxy,
            switch: true,
            override: {
                web: {
                    disabled: true,
                    state: true,
                }
            }
        },

        {
            icon: "child-friendly",
            description: "Enable safety mode",
            state: safetyMode,
            function: toggleSafetyMode,
            switch: true
        },

        {
            icon: "brightness-low",
            description: "Enable dark mode",
            state: darkMode,
            function: toggleDarkMode,
            switch: true
        },

        {
            icon: "public",
            description: "Proxy tracks over " + host,
            state: proxyYTMM,
            function: toggleProxyM,
            switch: true,
        },

        {
            icon: "animation",
            description: "Enable audio visualizer",
            state: visualizer,
            function: toggleAudioVisualizer,
            switch: true
        }
    ];
    
    return <FlatList
        bounces={true}
        contentContainerStyle={styles.content}

        data={items}
        renderItem={drawItem}
    />
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        justifyContent: "flex-end",
        
        maxWidth: 800,
        width: "100%",
        alignSelf: "center"
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        height: 70
    },
});