import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Surface, Text, Button, TouchableRipple } from "react-native-paper";
import { SearchResult } from "ytmusic-api";
import { Image, Platform, View } from "react-native";

import { resultStyle } from '../../styles/Search';
import { showMoreModal } from '../modals/MoreModal';
import Navigation from '../../services/ui/Navigation';

type EntryProps = {
    entry: SearchResult;
    index?: number;
}

export default function Entry({ entry, index }: EntryProps) {
    const thumbnail: string = entry.thumbnails[
        entry.thumbnails.length - 1].url;
    const title: string = entry.name;
    const subtitle: string = entry.artist ? entry.artist.name : "";
    const artistId: string = entry.artist ? entry.artist.artistId : "";
    
    const { videoId, albumId, browseId, playlistId } = entry;

    const view = {
        title: title,
        subtitle: subtitle,
        thumbnail: thumbnail,
        videoId: videoId,
        browseId: browseId,
        playlistId: playlistId,
    };

    return <TouchableRipple
        onPress={() => Navigation.handleMedia(view)}
        onLongPress={() => showMoreModal(view)}
    >
        <Surface
            style={{
                marginHorizontal: 5,
                marginBottom: 10,
                borderRadius: 5,
                flexDirection: 'row',
                alignSelf: "stretch",
            }}
        >
            {
                index != undefined
                    ? <Text style={{
                        width: 30,
                        textAlign: "center",
                        alignSelf: "center",
                    }}>
                        {index}
                    </Text>

                    : null
            }

            <Image 
                style={[
                    resultStyle.resultCover,
                    { }
                ]}
                progressiveRenderingEnabled={true}
                source={{uri: view.thumbnail}}
            />

            <View
                style={{
                    paddingLeft: 50,
                    alignSelf: "center",
                    flex: 1
                }}
            >
                <Text
                    numberOfLines={1}
                >
                    {title}
                </Text>
                <Text
                    numberOfLines={1}
                >
                    {view.subtitle}
                </Text>
            </View>

            <Button style={{alignSelf: "center"}}>
                <MaterialIcons
                    name="more-vert"
                    size={24}
                />
            </Button>
        </Surface>
    </TouchableRipple>;
}