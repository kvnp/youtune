
import { useEffect, useState } from 'react'
import { SectionList } from 'react-native';
import { SearchResult } from 'ytmusic-api';
import {
    Searchbar,
    Surface,
    Text,
} from 'react-native-paper'
import {
    router,
    useLocalSearchParams
} from 'expo-router';

import { styles } from '@/src/lib/ui'
import API from '../../legacy/services/api/API';
import {resultHomeStyle} from '../../legacy/styles/Home';
import Entry from '../../legacy/components/shared/Entry';

const Search = () => {
    const { q } = useLocalSearchParams<{ q?: string }>();
    const [query, setQuery] = useState(q || '');
    const [loading, setLoading] = useState(false);
    const [shelves, setShelves] = useState<{
        title: string, data: SearchResult[]
    }[]>([]);

    // Search logic
    useEffect(() => {
        // TODO: Implement search suggestions
        if (query !== '') {
            setLoading(true);
        }

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, [query])

    useEffect(() => {
        if (query.length > 0)
            search();
    }, []);

    const search = () => {
        if (query.length > 0) {
            router.setParams({ q: query });
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
                        return;
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
                        shelf.title = shelf.title
                            .charAt(0).toUpperCase() +
                            shelf.title.slice(1).toLowerCase() +
                            "s";
                    
                    console.log(shelves);
                    setShelves(shelves);
                    setLoading(false);
                })
                .catch(e => {
                    setLoading(false);
                    console.error(e);
                });
        }
    }

    return <Surface style={{ flex: 1, gap: 16 }}>
        <Searchbar
            value={query}
            loading={loading}
            onChangeText={v => setQuery(v)}
            onSubmitEditing={search}
            placeholder="Type here to search..."
            style={{
                marginTop: 16,
                marginHorizontal: 16
            }}
        />

        <Surface style={styles.screen}>
            <SectionList
                sections={shelves}
                refreshing={loading}
                onRefresh={() => search()}
                style={{ width: "100%" }}
                contentContainerStyle={{
                    height: "100%",
                    display: "flex",
                }}
                
                keyExtractor={(item, index) => index + ""}
                renderItem={
                    ({ item }) => <Entry entry={item}/>
                }

                ListEmptyComponent={
                    <Text style={{
                        fontSize: 36,
                        height: "100%",
                        alignSelf: "center",
                        alignContent: "center",
                    }}>
                        🔍
                    </Text>
                }

                renderSectionHeader={({ section: { title } }) => (
                    <Surface
                        style={{ paddingBottom: 10 }}
                    >
                        <Text
                            style={resultHomeStyle.homeText}
                        >
                            {title}
                        </Text>
                    </Surface>
                )}
            />
        </Surface>
    </Surface>
}

export default Search
