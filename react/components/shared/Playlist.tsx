import {
    Text,
    Image
} from "react-native";
import { useTheme } from '@react-navigation/native';
import { TouchableRipple } from 'react-native-paper';

import Navigation from '../../services/ui/Navigation';
import { showMoreModal } from '../modals/MoreModal';
import { playlistStyle } from '../../styles/Playlist';
import { SearchResult } from "ytmusic-api";

type PlaylistProps = {
    entry: SearchResult;
    navigation: any;
    index?: number;
    style?: any;
}

export default function Playlist({ entry, navigation, index, style }: PlaylistProps) {
    const thumbnail: string = entry.thumbnails[entry.thumbnails.length - 1].url;
    const title: string = entry.name;
    const subtitle: string = entry.artist ? entry.artist.name : "";
    const artistId: string = entry.artist ? entry.artist.artistId : "";
    const { videoId, albumId, browseId, playlistId } = entry;

    let view = {
        title: title,
        subtitle: subtitle,
        thumbnail: thumbnail,
        videoId: videoId,
        browseId: browseId,
        playlistId: playlistId
    };

    const { colors } = useTheme();

    return (
        <TouchableRipple
            rippleColor={colors.primary}
            onLongPress={() => showMoreModal(view)}
            onPress={() => {
                Navigation.transitionPlaylist = {
                    playlistId: playlistId,
                    browseId: browseId,
                    title: title,
                    thumbnail: thumbnail
                }
                Navigation.handleMedia(view, false, navigation);
            }}
            style={[style, playlistStyle.container]}
        >
            <>
                <Image style={playlistStyle.cover} source={{ uri: thumbnail }} />
                <Text style={[playlistStyle.title, { color: colors.text }]} numberOfLines={2}>
                    {title}
                </Text>
            </>
        </TouchableRipple>
    );
}