import { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    ScrollView
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { TouchableRipple } from "react-native-paper";
import SlidingUpPanel from 'rn-sliding-up-panel';
import API from "../../services/api/API";

var lastY;
export default function SwipeLyrics({playlist, track, backgroundColor, textColor, style}) {
    const { height } = Dimensions.get("window");
    const colors = useTheme();
    const panel = useRef(null);
    const container = useRef(null);
    const draggableRange = { top: height - 50, bottom: 50 }
    const draggedValue = new Animated.Value(0);

    const handleMovement = e => {
        let currentY = e.touches[0].clientY;
        let scroll = container.current;
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
        if (!track)
            return;

        container.current.innerHtml = "";
        // API.getLyrics(track)
        //     .then(response => {
        //         if (response == null)
        //             return;
                
        //         for (let s of response.lyrics) {
        //             container.current.insertAdjacentText('beforeend', s);
        //             container.current.insertAdjacentHTML('beforeend', "<br>");
        //         }
        //     });
    }, [track]);

    useEffect(() => {
        let scroll = container.current;
        scroll.addEventListener("touchmove", handleMovement);
        scroll.style.alignItems = "center";
        scroll.style.fontFamily = "system-ui";
        scroll.style.fontSize = "large";
        scroll.style.paddingLeft = "5%";
        scroll.style.paddingRight = "5%";
        
        
    }, []);

    return <SlidingUpPanel
        showBackdrop={false}
        ref={panel}
        allowDragging={true}
        draggableRange={draggableRange}
        animatedValue={draggedValue}
        snappingPoints={[50, height - 50]}
        height={height}
        friction={0.5}
    >
        <View style={[styles.panel, {position: "absolute", top: -50}]}>
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
                    LYRICS
                </Text>
                </>
            </TouchableRipple>

            <ScrollView
                ref={container}
                style={{
                    height: height - 100,
                    backgroundColor: backgroundColor,
                    color: textColor,
                    paddingBottom: "5%"
                }}
                contentContainerStyle={stylesRest.playlistContainer}
            >

            </ScrollView>
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
        paddingBottom: "5%"
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