import { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text } from "react-native";

import { TouchableRipple} from "react-native-paper";
import { useNavigation, useTheme } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { State } from 'react-native-track-player';
import Music from "../../services/music/Music";
import Cast from "../../services/music/Cast";

import ScrollingText from "../shared/ScrollingText";
import { showStreamModal } from "../modals/StreamModal";

export default function MiniPlayer({style, containerStyle}) {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [state, setState] = useState(Music.state);
    const [track, setTrack] = useState(Music.metadata);
    const [position, setPosition] = useState(Music.position);

    const positionLength = (100 / track.duration * position);
    const positionWidth = positionLength + "%";
    const remainingWidth = (100 - positionLength) + "%";

    useEffect(() => {
        const stateListener = Music.addListener(
            Music.EVENT_STATE_UPDATE,
            state => setState(state)
        );

        const metadataListener = Music.addListener(
            Music.EVENT_METADATA_UPDATE,
            metadata => setTrack(metadata)
        );

        const positionListener = Music.addListener(
            Music.EVENT_POSITION_UPDATE,
            pos => setPosition(pos)
        );

        return () => {
            stateListener.remove();
            metadataListener.remove();
            positionListener.remove();
        }
    }, []);

    const onNext = () => Music.skipNext();
    const onStop = () => {
        if (Music.isStreaming)
            Cast.reset();
        else
            Music.reset();
    };

    const onPlay = () => {
        state == State.Playing
            ? Music.pause()
            : Music.play();
    };

    const onOpen = () => {
        navigation.navigate("Music", {
            v: track.videoId,
            list: track.playlistId
        });
    }
    
    const { title, artist, artwork } = track;

    return <View style={[styles.main, {backgroundColor: colors.card}, containerStyle]}>
        <View style={[styles.main, {
            justifyContent: "space-evenly",
            width: "100%",
            alignSelf: "center"
        }, style]}>
            <View style={styles.playback}>
                <View style={{width: positionWidth, backgroundColor: colors.text}}></View>
                <View style={{width: remainingWidth, backgroundColor: colors.card}}></View>
            </View>
            <View style={styles.container}>
                <Image source={{uri: artwork}} style={styles.image}/>
                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    onPress={onOpen}
                    style={[
                        styles.textContainer,
                        {alignItems: "stretch", padding: 0, margin: 0}
                    ]}
                >
                    <>
                    <ScrollingText>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.titleText,
                                {color: colors.text}
                            ]}
                        >
                            {title}
                        </Text>
                    </ScrollingText>

                    <ScrollingText>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.subtitleText,
                                {color: colors.text,}
                            ]}
                        >
                            {artist}
                        </Text>
                    </ScrollingText>
                    </>
                </TouchableRipple>

                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    style={[
                        styles.button,
                        {color: colors.card, borderRadius: 25}
                    ]}
                    onPress={onStop}
                    onLongPress={Music.isStreaming ? showStreamModal : undefined}
                >
                    <MaterialIcons
                        name={
                            Music.isStreaming
                                ? "cast-connected"
                                : "clear"
                        }
                        color={colors.text}
                        size={29}
                    />
                </TouchableRipple>

                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    style={[
                        styles.button,
                        {color: colors.card, borderRadius: 25}
                    ]}
                    onPress={onPlay}
                >
                    <MaterialIcons
                        name={
                            state == State.Playing
                                ? "pause"
                                : "play-arrow"
                        }
                        color={colors.text}
                        size={29}
                    />
                </TouchableRipple>

                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    style={[
                        styles.button,
                        {color: colors.card, borderRadius: 25}
                    ]}
                    onPress={onNext}
                >
                        <MaterialIcons
                            name="skip-next"
                            color={colors.text}
                            size={29}
                        />
                </TouchableRipple>
            </View>
        </View>
    </View>
}

const styles = StyleSheet.create({
    main: {
        flexDirection: "column",
        padding: 0,
        margin: 0,
        overflow: "hidden"
    },

    playback: {
        height: 1.5,
        flexDirection: "row"
    },

    container: {
        flexDirection: "row",
        overflow: "hidden",
        paddingRight: 15,
        paddingLeft: 15,
        alignItems: "center",
        alignSelf: "stretch",
    },

    image: {
        width: 50,
        height: 50,
        alignSelf: "stretch",
        backgroundColor: "gray",
    },

    textContainer: {
        flex: 1,
        overflow: "hidden",
        marginHorizontal: 10,
    },

    titleText: {
        fontWeight: "bold"
    },

    subtitleText: {
        
    },

    button: {
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
        paddingLeft: 2,
        paddingRight: 2
    }
});