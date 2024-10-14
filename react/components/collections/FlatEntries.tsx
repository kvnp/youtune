import { FlatList } from 'react-native';
import Entry from '../shared/Entry';

export default function FlatEntries({entries, playlistId, navigation}) {
    return <FlatList
        contentContainerStyle={{
            marginHorizontal: 10,
            alignSelf: "center",
            maxWidth: 800,
            width: "100%"
        }}

        data={entries}
        renderItem={
            ({item, index}) => <Entry 
                entry={item}
                index={index + 1}
                forcedPlaylistId={playlistId}
                navigation={navigation}
            />
        }

        keyExtractor={item => item.title}/>
}