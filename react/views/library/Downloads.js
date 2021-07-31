import React, { useEffect, useState } from 'react';

import {
    ScrollView,
    Text,
    View,
    ActivityIndicator
} from "react-native";

import { Button } from 'react-native-paper';

import { useTheme } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entry from "../../components/shared/Entry";
import { loadSongLocal, localIDs } from "../../modules/storage/SongStorage";
import { shelvesStyle } from '../../styles/Shelves';
import { playLocal } from '../../modules/event/mediaNavigator';
import { dbLoading } from '../../modules/storage/SongStorage.web';

export default Downloads = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const playlistId = "LOCAL_DOWNLOADS";

    const loadEntries = async() => {
        for (let i = 0; i < localIDs.length; i++) {
            let { title, artist, artwork, id } = await loadSongLocal(localIDs[i]);
            entries.push({
                title,
                artist,
                artwork,
                id,
                playlistId
            });
        }

        setEntries(entries);
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!dbLoading) {
                if (entries.length != localIDs.length)
                    loadEntries();
            } else {
                let intervalId = setInterval(() => {
                    if (!dbLoading) {
                        clearInterval(intervalId);
                        loadEntries();
                    }
                }, 200);
            }
        });

        return () => unsubscribe();
    }, []);

    const {dark, colors} = useTheme();

    const emptyFiller = <View style={{height: 300, justifyContent: "space-evenly", alignItems: "center", marginTop: "auto"}}>
        <MaterialIcons name="get-app" color={colors.text} size={50}/>
        <Text style={{fontSize: 20, color: colors.text}}>Downloaded songs are displayed here</Text>
        
        <Button
            mode="outlined"
            onPress={() => navigation.navigate("Search")}
        >
            Look for music
        </Button>
    </View>

    return dbLoading
        ? <View style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <ActivityIndicator size="large"/>
        </View>

        : entries.length > 0

        ? <ScrollView
            style={{flexDirection: "column-reverse"}}
            contentContainerStyle={[
                shelvesStyle.searchContainer,
                entries.length != 0 ? {flex: "none"} : undefined
            ]}
        >
            {
                entries.map(track => {
                    return <Entry
                        key={track.id}
                        entry={{
                            title: track.title,
                            subtitle: track.artist,
                            thumbnail: track.artwork,
                            videoId: track.id,
                            playlistId: track.playlistId
                        }}
                        navigation={navigation}
                    />
                })
            }
            {
                <Button
                    mode="contained"
                    style={{margin: 20, alignItems: "stretch"}}
                    labelStyle={{alignItems: "stretch"}}
                    onPress={() => playLocal("LOCAL_DOWNLOADS", navigation)}
                >
                    Play all
                </Button>
            }
        </ScrollView>

        : emptyFiller;
}