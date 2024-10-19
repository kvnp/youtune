import { Image } from "react-native";
import { Text, Button } from 'react-native-paper';

import Navigation from '../../services/ui/Navigation';
import { showMoreModal } from '../modals/MoreModal';
import { playlistStyle } from '../../styles/Playlist';
import { SearchResult } from "ytmusic-api";

type PlaylistProps = {
    entry: SearchResult;
    index?: number;
    style?: any;
}

export default function Playlist({ entry, index, style }: PlaylistProps) {
    const thumbnail: string = entry.thumbnails[
        entry.thumbnails.length - 1].url;

    const title: string = entry.name;
    const subtitle: string = entry.artist
        ? entry.artist.name : "";
    const artistId: string = entry.artist
        ? entry.artist.artistId : "";

    const { videoId, albumId, browseId, playlistId } = entry;

    let view = {
        title: title,
        subtitle: subtitle,
        thumbnail: thumbnail,
        videoId: videoId,
        browseId: browseId,
        playlistId: playlistId
    };

    return (
        <Button
            onLongPress={() => showMoreModal(view)}
            onPress={() => 
                Navigation.handleMedia(view)
            }
            style={[
                style,
                playlistStyle.container
            ]}
        >
            <Image
                style={playlistStyle.cover}
                source={{ uri: thumbnail }}
            />
            <Text
                numberOfLines={2}
                ellipsizeMode='tail'
                style={playlistStyle.title}
            >
                {title}
            </Text>
        </Button>
    );
}