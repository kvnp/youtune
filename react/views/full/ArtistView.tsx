import { useState, useCallback } from "react";
import {
    View,
    Text,
    ImageBackground,
    Pressable
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/core";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";

import API from "../../services/api/API";
import FlatShelves from "../../components/collections/FlatShelves";

import { bottomBarStyle } from "../../styles/BottomBar";
import { rippleConfig } from "../../styles/Ripple";
import { insertBeforeLast } from "../../utils/Navigation";

export default function ArtistView({ route, navigation }) {
    const {dark, colors}  = useTheme();
    const [artist, setArtist] = useState(null);

    const gradientColors = ["rgba(242, 242, 242, 1)", "rgba(242, 242, 242, 0.8)", "rgba(242, 242, 242, 0.5)", "rgba(242, 242, 242, 0.2)"];
    const gradientColorsDark = ["rgba(0, 0, 0, 1)", "rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.2)"];

    useFocusEffect(
        useCallback(() => {
            navigation.setOptions({ title: "Loading" });
            API.getBrowseData(route.params.channelId)
                .then(artist => {
                    setArtist(artist);
                    navigation.setOptions({ title: artist.header.title });
                });
        }, [])
    )

    const shelves = artist != null
        ? artist.shelves
        : null;
    
    return <>
        <FlatShelves shelves={shelves} navigation={navigation}/>

        <ImageBackground style={bottomBarStyle.container} source={{uri: artist == null ? null : artist.header.thumbnail}}>
            <LinearGradient style={bottomBarStyle.artistGradientStyle} colors={dark ? gradientColorsDark : gradientColors}>
                <View style={bottomBarStyle.topRow}>
                    <View style={bottomBarStyle.artistColumn}>
                        {
                            artist == null
                            ? <View style={{width: 200, height: 20, marginBottom: 2, backgroundColor: colors.text}}/>
                            : <Text style={[bottomBarStyle.artistName, {color: colors.text}]}>
                                {artist.header.title}
                            </Text>
                        }

                        <Pressable android_ripple={rippleConfig} style={bottomBarStyle.subscribeArtist}>
                            <Text style={{fontWeight: "bold", color: "white"}}>
                                {"SUBSCRIBE " + (artist == null ? "-" : artist.header.subscriptions)}
                            </Text>
                        </Pressable>
                    </View>
                    <Pressable
                        android_ripple={rippleConfig}
                        onPress={() => {
                            if (!navigation.canGoBack())
                                navigation.dispatch(insertBeforeLast("App"));
                            navigation.navigate("App");
                        }}
                    >
                        <View style={[bottomBarStyle.closeButton, {backgroundColor: colors.card}]}>
                            <MaterialIcons name="arrow-back" color={colors.text} size={20}/>
                        </View>
                    </Pressable>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignSelf: "stretch",
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "space-evenly",
                    paddingVertical: 10
                }}>
                    <Pressable android_ripple={rippleConfig} style={{backgroundColor: colors.card}}>
                        <Text style={[bottomBarStyle.buttonText, bottomBarStyle.button, {color: colors.text}]}>PLAY</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleConfig} style={{backgroundColor: colors.card}}>
                        <Text style={[bottomBarStyle.buttonText, bottomBarStyle.button, {color: colors.text}]}>ADD TO LIBRARY</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleConfig} style={{backgroundColor: colors.card}}>
                        <Text style={[bottomBarStyle.buttonText, bottomBarStyle.button, {color: colors.text}]}>SHARE</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </ImageBackground>
    </>
}