import { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";

import { TouchableRipple} from "react-native-paper";
import { useNavigation, useTheme } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { State } from 'react-native-track-player';
import Music from "../../services/music/Music";
import Cast from "../../services/music/Cast";

import ScrollingText from "../shared/ScrollingText";
import { showStreamModal } from "../modals/StreamModal";

var firstY;
export default function MiniPlayer({style, containerStyle}) {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [state, setState] = useState(Music.state);
    const [track, setTrack] = useState(Music.metadata);
    const [position, setPosition] = useState(Music.position);
    const currentHeight = useRef(0);
    const container = useRef(null);

    const positionLength = (100 / track.duration * position);
    const positionWidth = positionLength + "%";
    const remainingWidth = (100 - positionLength) + "%";

    const handleMove = e => {
        container.current.style.transition = "";
        let y;
        if (e instanceof TouchEvent)
            y = e.touches[0].clientY;
        else
            y = e.clientY;

        if (!firstY)
            firstY = y;

        let newHeight = firstY - y + currentHeight.current;
        let newHeightPx = newHeight + "px";
        // if (newHeight >= 0 && newHeight <= 50)
        //     moveMargin(newHeightPx);

        container.current.style.height = newHeightPx;
    };

    const resetMove = () => {
        disableMouse();
        firstY = 0;

        let thisHeight = Number(container.current.style.height.slice(0, -2));
        if (thisHeight <= 10)
            onStop();
        else if (thisHeight >= 100)
            navigation.navigate("Music");

        container.current.style.height = currentHeight.current + "px";
        // resetMargin();
    };

    useEffect(() => {
        currentHeight.current = Number.isInteger(containerStyle.height)
            ? containerStyle.height
            : Number(containerStyle.height.slice(0, -2));
    }, [containerStyle]);

    const enableMouse = () => {
        container.current.style.pointerEvents = "auto";
        container.current.parentElement.style.pointerEvents = "none";
        container.current.addEventListener("mousemove", handleMove);
    }
    const disableMouse = () => {
        container.current.style.pointerEvents = "";
        container.current.parentElement.style.pointerEvents = "";
        container.current.removeEventListener("mousemove", handleMove);
    }

    useEffect(() => {
        container.current.addEventListener("mousedown", enableMouse);
        container.current.addEventListener("mouseup", resetMove);
        container.current.addEventListener("touchmove", handleMove);
        container.current.addEventListener("touchend", resetMove);

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

        document.addEventListener("mouseleave", resetMove);
        return () => {
            document.removeEventListener("mouseleave", resetMove);
            stateListener.remove();
            metadataListener.remove();
            positionListener.remove();
        }
    }, []);

    const onNext = () => Music.skipNext();
    const onStop = () => {
        container.current.style.transition = "height .25s";
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
    };
    
    const { title, artist, artwork } = track;

    return <View ref={container} style={[styles.main, {backgroundColor: colors.card}, containerStyle]}>
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
                <div style={styles.image}>
                    <img src={artwork} loading="lazy" onLoad={e => e.target.style.opacity = 1} style={{width: "100%", height: "100%", objectFit: "contain", backgroundColor: "gray", opacity: 0, transition: "opacity .4s ease-in"}}></img>
                </div>

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
        paddingRight: 10
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