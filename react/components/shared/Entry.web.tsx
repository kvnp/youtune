import { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { useTheme } from '@react-navigation/native';
import { TouchableRipple } from 'react-native-paper';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import HTTP from "../../services/api/HTTP";
import Navigation from '../../services/ui/Navigation';
import Downloads from "../../services/device/Downloads";

import { resultStyle } from '../../styles/Search';
import { showModal } from '../modals/MoreModal';

export default function Entry({ entry, navigation, index, forcedPlaylistId }) {
    const { title, subtitle, artist, thumbnail, artwork,
            videoId, browseId, playlistId } = entry;

    const view = {
        title: title,
        subtitle: subtitle || artist,
        thumbnail: thumbnail || artwork,
        videoId: videoId,
        browseId: browseId,
        playlistId: forcedPlaylistId
            ? forcedPlaylistId
            : playlistId,
    };

    const { colors } = useTheme();
    const isDownloaded = useRef(false);

    useEffect(() => {
        if (view.playlistId)
            if (!view.playlistId.includes("LOCAL"))
                isDownloaded.current = Downloads.isTrackDownloaded(view.videoId);
    }, []);

    return <TouchableRipple
        borderless={true}
        rippleColor={colors.primary}
        onPress={() => Navigation.handleMedia(view, false, navigation)}
        onLongPress={() => showModal(view)}

        style={{
            marginHorizontal: 5,
            marginBottom: 10,
            borderRadius: 5,
            height: 70,
            backgroundColor: colors.card,
            flexDirection: 'row',
        }}
    >
        <>
        {
            index != undefined
                ? <Text style={{
                    width: 30,
                    textAlign: "center",
                    alignSelf: "center",
                    color: colors.text
                }}>
                    {index}
                </Text>

                : null
        }

        <div style={{...resultStyle.resultCover, display: "flex", justifyContent: "end"}}>
            <img
                src={view.thumbnail}
                draggable="false"
                loading="lazy"
                onLoad={e => e.target.style.opacity = 1}
                onError={(e) => {
                    let self: JSX.IntrinsicElements["img"] = e.target;
                    self.src = HTTP.getProxyUrl(view.thumbnail);
                }}
                style={{width: "100%", height: "100%", objectFit: "cover", opacity: 0, transition: "opacity .4s ease-in"}}
            >
            </img>
            {
                isDownloaded.current
                    ? <MaterialIcons style={{position: "absolute", background: "radial-gradient(green,transparent)"}} name="file-download-done" color="white" size={24}/>
                    : undefined
            }
        </div>
        
        <View style={resultStyle.resultColumnOne}>
            <Text numberOfLines={1} style={[resultStyle.resultText, {color: colors.text}]}>{view.title}</Text>
            <Text numberOfLines={1} style={[resultStyle.resultText, {color: colors.text}]}>{view.subtitle}</Text>
        </View>

        <TouchableRipple
            borderless={true}
            rippleColor={colors.primary}
            onPress={() => showModal(view)}
            style={{
                justifyContent: "center",
                borderRadius: 25,
                alignSelf: "center",
                alignItems: "center",
                width: 50,
                height: 50,
                margin: 0,
                padding: 0
            }}
        >
            <MaterialIcons name="more-vert" color={colors.text} size={24}/>
        </TouchableRipple>
        
        </>
    </TouchableRipple>;
}