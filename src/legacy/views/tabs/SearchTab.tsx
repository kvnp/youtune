import { useEffect, useState, useRef } from 'react';
import {
    SectionList,
    Text,
    View,
    TextInput,
    Keyboard,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import API from '../../services/api/API';
import Entry from '../../components/shared/Entry';
import { shelvesStyle } from '../../styles/Shelves';
import { rippleConfig } from '../../styles/Ripple';
import { searchBarStyle } from '../../styles/Search';
import { resultHomeStyle, preResultHomeStyle } from '../../styles/Home';
import { SearchResult } from 'ytmusic-api';

export default function SearchTab() {
    const [searchText, setSearchText] = useState("Look for music using the search bar");
    const [shelves, setShelves] = useState<{ title: string, data: SearchResult[] }[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");

    const { dark, colors } = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const searchInput = useRef<TextInput>(null);

    useEffect(() => {
        if (route.params)
            if (route.params.q) {
                setQuery(route.params.q);
                search(route.params.q, null);
            }

        const unsubFocus = navigation.addListener('focus', () => {
            searchInput.current!.focus();
        });

        return unsubFocus;
    }, []);

    const search = (query: string) => {
        // @ts-ignore setParams is not in the types
        navigation.setParams({ q: query });
        Keyboard.dismiss();
        if (query.length > 0) {
            setLoading(true);
            API.waitForInitialization()
                .then(async() => {
                    let data: SearchResult[] = [];
                    try {
                        data = [
                            ...await API.YTMusic.searchSongs(query),
                            ...await API.YTMusic.search(query),
                        ];
                    } catch (e) {
                        console.error(e);
                    }

                    let shelves: {
                        title: string
                        data: SearchResult[]
                    }[] = [];

                    data.map(item => {
                        const type_index = shelves.findIndex(
                            shelf => shelf.title == item.type
                        );
                        if (type_index == -1)
                            shelves.push({
                                title: item.type,
                                data: [item]
                            });
                        else
                            shelves[type_index].data.push(item);
                    });

                    for (const shelf of shelves)
                        shelf.title = shelf.title.charAt(0).toUpperCase() +
                            shelf.title.slice(1).toLowerCase() + "s";
                    
                    setShelves(shelves);
                    setLoading(false);
                })
                .catch(e => {
                    setLoading(false);
                    setSearchText("You are offline");

                    setTimeout(() => {
                        setSearchText("Look for music using the search bar");
                    }, 2000);
                    console.error(e);
                });
        }
    }

    return <>
        <SectionList
            contentContainerStyle={shelvesStyle.searchContainer}

            ListEmptyComponent={<>
                <Text style={[preResultHomeStyle.preHomeBottomText, preResultHomeStyle.preHomeTopText, { color: colors.text }]}>🔍</Text>
                <Text style={[preResultHomeStyle.preHomeBottomText, { color: colors.text }]}>{searchText}</Text>
            </>}

            renderSectionHeader={({ section: { title } }) => (
                <View style={[resultHomeStyle.textView, { paddingBottom: 10 }]}>
                    <Text style={[resultHomeStyle.homeText, { color: colors.text }]}>{title}</Text>
                </View>
            )}

            progressViewOffset={20}
            sections={shelves}

            refreshing={loading}
            onRefresh={() => search(query, null)}

            keyExtractor={(item, index) => index + ""}
            renderItem={({ item }) => <Entry entry={item} navigation={navigation} />}
        />

        <KeyboardAvoidingView enabled={Platform.OS == "ios" ? true : false} behavior="padding" keyboardVerticalOffset={170}>
            <View style={[searchBarStyle.container, { backgroundColor: colors.card }]}>
                <View style={searchBarStyle.inputBox}>
                    <TextInput style={[searchBarStyle.input, { color: colors.text }]}
                        ref={searchInput}
                        placeholder="Search"
                        value={query}
                        onChangeText={newQuery => setQuery(newQuery)}
                        placeholderTextColor={colors.text}
                        onSubmitEditing={() => search(query, null)} />
                    <Pressable onPress={() => search(query, null)}
                        android_ripple={rippleConfig}
                        style={searchBarStyle.button}>
                        {loading
                            ? <ActivityIndicator color={colors.text} size="small" />
                            : <MaterialIcons name="search" color={colors.text} size={24} />
                        }
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    </>
}