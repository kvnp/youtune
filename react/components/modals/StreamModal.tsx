import { useState, useEffect } from "react";
import {
    Modal,
    Pressable,
    View,
    StyleSheet,
    Platform,
    Text
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { Slider } from '@miblanchard/react-native-slider';
import { Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { appColor } from "../../styles/App";
import Music from "../../services/music/Music";
import Cast from "../../services/music/Cast";

export const showStreamModal = e => {
    if (showModal)
        showModal(e);
};

var showModal;

export default function StreamModal() {
    const {colors} = useTheme();
    const [deviceName, setDeviceName] = useState("");
    const [volume, setVolume] = useState(0);
    const [visible, setVisible] = useState(false);

    const getIcon = capabilities => {
        if (capabilities)
            if (capabilities.includes("video_out"))
                return "tv";
        
        return "speaker";
    }

    useEffect(() => {
        showModal = () => {
            setVolume(Cast.volume);
            setVisible(true);
        };

        const volumeListener = Cast.addListener(Cast.EVENT_VOLUME, value => setVolume(value));
        const castListener = Cast.addListener(Cast.EVENT_CAST, e => {
            let name;
            if (e.castState == "NOT_CONNECTED")
                name = "Disconnected";
            else if (e.castState == "CONNECTING")
                name = "Connecting";
            else if (e.castState == "CONNECTED")
                name = Cast.deviceInfo.receiverType[0].toUpperCase() + Cast.deviceInfo.receiverType.slice(1)
                       + " | " +
                       Cast.deviceInfo.friendlyName;

            if (name != deviceName)
                setDeviceName(name);
        });

        return () => {
            castListener.remove();
            volumeListener.remove();
        };
    }, []);

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        onDismiss={() => setVisible(false)}
        hardwareAccelerated={true}
    >
        <Pressable
            style={{height: "100%", width: "100%", justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.3)"}}
            onPress={() => setVisible(false)}
        >
            <Pressable style={{
                paddingHorizontal: 10,
                maxWidth: 800,
                alignSelf: "center",
                width: "100%"
            }}>
                <View style={[modalStyles.header, {backgroundColor: colors.border}, Platform.OS == "web" ? {cursor: "default"} : undefined]}>
                    <View style={[modalStyles.headerText, {flexDirection: "row", alignItems: "center"}]}>
                        <MaterialIcons
                            color={colors.text}
                            size={25}
                            name={
                                Music.isStreaming
                                    ? getIcon(Cast.deviceInfo.capabilities)
                                    : "broadcast-off"
                            }
                        />
                        
                        <Text style={{color: colors.text, paddingLeft: 20}} numberOfLines={1}>
                            {deviceName}
                        </Text>
                    </View>
                </View>

                <View style={{height: 80, alignItems: "center", paddingHorizontal: 50, flexDirection: "row", backgroundColor: colors.card, cursor: Platform.OS == "web" ? "default" : undefined}}>
                    <MaterialIcons name="volume-up" color={colors.text} size={25}/>
                    <Slider
                        onSlidingComplete={position => {
                            Cast.volume = position;
                            setVolume(volume);
                        }}
                        
                        value={volume}
                        maximumValue={1}
                        minimumTrackTintColor={colors.text}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                        thumbStyle={{color: colors.primary}}
                        style={{paddingLeft: 20}}
                    />
                </View>

                <View style={{height: 80, width: "100%", backgroundColor: colors.card, flexDirection: "row", justifyContent: "center", cursor: Platform.OS == "web" ? "default" : undefined}}>
                    <Button
                        mode="contained"
                        style={{ marginHorizontal: 20, alignSelf: "center"}}
                        onPress={() => Cast.disconnect()}
                    >
                        <Text>DISCONNECT</Text>
                    </Button>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
};

const modalStyles = StyleSheet.create({
    header: {
        flexDirection: "row",
        height: 70,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },

    headerText: {
        flex: 1,
        paddingLeft: 10,
        overflow: "hidden",
        width: 140,
    },

    thumbnail: {
        backgroundColor: appColor.background.backgroundColor,
        height: 50,
        width: 50
    },

    entry: {
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 50,
        height: 50,
    },

    entryView: {
        height: 50,
    }
});

const styles = StyleSheet.create({
    paddingView: {
        flexGrow: 1,
    },

    topText: {
        padding: 50,
        fontSize: 35,
        fontWeight: 'bold',
    },

    headerContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    },

    headerCenterContainer: {
        alignSelf: 'center',
    },

    inputText: {
        textAlign: 'justify',
        width: "100%",
        fontSize: 15
    },

    headerTopRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
        width: 200,
        paddingRight: 5,
        paddingLeft: 5
    },

    albumCover: {
        backgroundColor: 'darkgray',
        height: 70,
        width: 70,
        marginRight: 30,
    },

    closeButton: {
        backgroundColor: 'white',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 25,

        alignSelf: 'center',
    },

    headerButtonView: {
        paddingTop: 10,
        flexDirection: 'row',
        alignSelf: 'center'
    },

    headerButton : {
        marginRight: 5,
        marginLeft: 5,
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: 5
    },

    headerButtonText: {
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 20
    },

    closeButtonText: {
        fontSize: 15,
    }
});

/*
"Man hilft immer zwei", Elias Koné - 14. Juni 2020
*/