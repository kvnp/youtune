import { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    FlatList
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { TouchableRipple } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SlidingUpPanel from 'rn-sliding-up-panel';

import Downloads from "../../services/device/Downloads";
import Music from "../../services/music/Music";
import SwipeLyrics from "./SwipeLyrics";

var lastY;
export default function SwipePlaylist({playlist, track, backgroundColor, textColor, style}) {
    const { height } = Dimensions.get("window");
    const colors = useTheme();
    const panel = useRef(null);
    const container = useRef(null);
    const draggableRange = { top: height - 50, bottom: 50 }
    const draggedValue = new Animated.Value(50);

    const handleMovement = e => {
        let currentY = e.touches[0].clientY;
        let scroll = container.current._listRef._scrollRef;
        if (scroll.scrollTop != 0) {
            if (currentY > lastY) {
                e.stopPropagation();
            }
        }
        lastY = currentY;
    }

    useEffect(() => {
        for (let i in style) {
            panel.current._content.style[i] = style[i];
            for (let node of panel.current._content.childNodes)
                node.style[i] = style[i];
        }
    }, [style]);

    useEffect(() => {
        container.current._listRef._scrollRef.style.flexFlow = "column-reverse";
        container.current._listRef._scrollRef.style.paddingBottom = "60px";
        
        let scroll = container.current._listRef._scrollRef;
        scroll.addEventListener("touchmove", handleMovement);
    }, []);

    return <SlidingUpPanel
        ref={panel}
        allowDragging={true}
        draggableRange={draggableRange}
        animatedValue={draggedValue}
        snappingPoints={[50, height - 50]}
        height={height}
        friction={0.5}
    >
        <View style={styles.panel}>
            <TouchableRipple 
                rippleColor={colors.primary}
                style={[styles.panelHeader, {backgroundColor: backgroundColor}]}
                onPress={() => panel.current.show()}
            >
                <>
                <View style={[
                    stylesRest.smallBar,
                    {backgroundColor: textColor}
                ]}/>
                <Text
                    style={{color: textColor}}
                    selectable={false}
                >
                    PLAYLIST
                </Text>
                </>
            </TouchableRipple>

            <FlatList
                ref={container}
                style={{
                    height: height - 150,
                    backgroundColor: backgroundColor
                }}
                contentContainerStyle={stylesRest.playlistContainer}

                data={playlist}
                keyExtractor={item => item.videoId }
                renderItem={
                    ({item, index}) => <TouchableRipple 
                        rippleColor={colors.primary}
                            style={{
                                height: 50,
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 5
                            }}

                            onPress={() => Music.skip(index)}
                        >
                            <>
                            {
                            track != null
                                ? track.videoId == item.videoId 
                                    ? <MaterialIcons style={{width: 30, textAlign: "center", textAlignVertical: "center"}} name="play-arrow" color={textColor} size={20}/>
                                    : <Text style={{width: 30, textAlign: "center", fontSize: 15, color: textColor}}>{index + 1}</Text>

                                : <Text style={{width: 30, textAlign: "center", fontSize: 15, color: textColor}}>{index + 1}</Text>
                            }

                            <div style={{height: 50, width: 50, marginRight: 10, backgroundColor: "gray"}}>
                                <img onLoad={e => e.target.style.opacity = 1} src={item.artwork} loading="lazy" style={{width: "100%", height: "auto", opacity: 0, transition: "opacity .4s ease-in"}}></img>
                            </div>
                            

                            <View style={{width: 0, flexGrow: 1, flex: 1}}>
                                <Text style={{color: textColor}} numberOfLines={2}>{item.title}</Text>
                                <Text style={{color: textColor}} numberOfLines={1}>{item.artist}</Text>
                            </View>

                            {
                                item != null
                                ? Downloads.isTrackDownloaded(item.videoId )
                                    ? <MaterialIcons
                                        style={{
                                            width: 30,
                                            textAlign: "center",
                                            textAlignVertical: "center"
                                        }}
                                        name="file-download-done"
                                        color={textColor}
                                        size={20}
                                    />

                                    : undefined
                                : undefined
                            }

                            {
                                item != null
                                ? Downloads.isTrackLikedSync(item.videoId )
                                    ? <MaterialIcons
                                        style={{
                                            width: 30,
                                            textAlign: "center",
                                            textAlignVertical: "center"
                                        }}
                                        name="thumb-up"
                                        color={textColor}
                                        size={20}
                                    />

                                    : undefined
                                : undefined
                            }
                            </>
                    </TouchableRipple>
                }
            />
            <SwipeLyrics
                style={style}
                textColor={textColor}
                backgroundColor={backgroundColor}
                track={track}
            />
        </View>
    </SlidingUpPanel>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "center"
    },

    panel: {
        flex: 1,
        backgroundColor: "transparent",
        position: "relative",
        alignSelf: "center",
        width: "100%",
        maxWidth: 800,
    },

    panelHeader: {
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: 10
    },

    textHeader: {
        fontSize: 28,
        color: "#FFF"
    }
});

const stylesRest = StyleSheet.create({
    playlistContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingBottom: 50
    },

    topAlign: {
        alignSelf: "center",
        marginBottom: 10
    },

    smallBar: {
        height: 4,
        width: 30,
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 10
    }
});