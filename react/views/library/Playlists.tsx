import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Platform,
    ActivityIndicator,
    View
} from "react-native";

import { useFocusEffect, useTheme } from "@react-navigation/native";

import Playlist from '../../components/shared/Playlist';
import AddPlaylistModal from "../../components/modals/AddPlaylistModal";

export default function Playlists({navigation}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const { colors } = useTheme();

    useFocusEffect(
        useCallback(() => {
            setModalVisible(false);
            if (loading) {
                setLoading(false);
            }
        }, [])
    );

    const addPlaylist = ({title, description}) => {
        let sum = title + description;

        for (let i = 0; i < playlists.length; i++) {
            if (playlists[i].title + playlists[i].subtitle == sum) {
                showWarning("playlist already exists");
                setModalVisible(false);
                return;
            }
        }

        setPlaylists([...playlists, {title: title, subtitle: description}]);
        setModalVisible(false);
    }

    const cancelModal = () => {
        setModalVisible(false);
    }

    const showWarning = message => {
        console.log(message);
    }

    return !loading
        ? <>
            <ScrollView contentContainerStyle={styles.playlistCollectionContainer}>
            <>
                <Playlist
                    key="Add Playlist"
                    playlist={{title: "Add Playlist", placeholder: "+"}}
                    onPress={() => setModalVisible(true)}
                    style={styles.playlist}
                />

                <Playlist
                    key="LOCAL_LIKES"
                    playlist={{title: "Liked Songs", playlistId: "LOCAL_LIKES", placeholder:"👍"}}
                    navigation={navigation}
                    style={styles.playlist}
                />

                {playlists.map(playlist => {
                    return <Playlist
                        key={playlist.title + playlist.subtitle}
                        playlist={playlist}
                        navigation={navigation}
                        style={styles.playlist}
                    />;
                })}
            </>
            </ScrollView>

            <AddPlaylistModal visible={modalVisible} addCallback={ info => addPlaylist(info)} cancelCallback={() => cancelModal()}/>
        </>
        : <View style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <ActivityIndicator size="large"/>
        </View>
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    
    modalView: {
        alignSelf: "center",
    },

    modalChild: {
        borderRadius: 10
    },

    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
    },

    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },

    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },

    header: {
        alignSelf: 'center',
        width: '100%',
        height: 50,
        position: 'absolute',
        bottom: -5
    },

    headerEntry: {
        height: 50,
        paddingRight: 15,
        paddingLeft: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerEntryFocus: {
        height: 50,
        paddingRight: 15,
        paddingLeft: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },

    headerEntryText: {
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },

    headerEntryTextFocus: {
        fontWeight: 'bold',
        borderBottomWidth: 3,
        borderBottomColor: 'gray',
    },

    playlistCollectionContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: "flex-end",
        flexWrap: Platform.OS == "web"
            ? "wrap"
            : "wrap-reverse"
        // wtf
    },

    playlist: {
        margin: 10,
        width: 150,
        height: 220
    },

    playlistTitle: {
        paddingTop: 5,
        fontSize: 15,
        fontWeight:'bold',
        width: '150%',
    },

    playlistDesc: {
        fontSize: 10,
    },

    newPlaylist: {
        width: 150,
        height: 150,
        textAlign: "center",
        fontSize: 100,
        color: 'white',
        backgroundColor: "gray"
    },

    addPlaylist: {

    }
});