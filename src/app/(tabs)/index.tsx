import { useEffect, useState } from 'react';

import {
    Text,
    Button,
    Surface,
    ActivityIndicator,
} from 'react-native-paper';
import { Platform, FlatList, View } from 'react-native';
import { HomeSection } from 'ytmusic-api';

import API from '@/src/legacy/services/api/API';
import { shelvesStyle } from '@/src/legacy/styles/Shelves';
import { preResultHomeStyle } from '@/src/legacy/styles/Home';
import Section from '@/src/legacy/components/collections/Section';
import { styles } from '@/src/lib/ui';

export default function HomeTab({navigation}: {navigation: any}) {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(false);
    const homeText = Platform.OS == "web"
        ? "Press the home icon to load"
        : "Pull down to load";

    const startRefresh = () => {
        setLoading(true);
        API.waitForInitialization()
            .then(_ => {
                const sections = API.YTMusic.getInitialHomeSections();
                setSections(sections);
                setLoading(false);
            })
            .catch(e => {
                // TODO: Handle error
                setLoading(false);
                console.error(e);
            });
    }

    useEffect(() => {
        startRefresh();
    }, []);

    return <Surface style={styles.screen}>
        <FlatList
            style={{width: "100%"}}
            contentContainerStyle={{justifyContent: "center"}}
            ListEmptyComponent={
                loading
                ? <Surface
                    style={shelvesStyle.scrollContainer}
                >
                    <ActivityIndicator
                        size="large"
                    />
                </Surface>

                : <Button
                    labelStyle={{paddingVertical: 30}}
                    style={{alignSelf: "center"}}

                    onPressOut={
                        Platform.OS == "web"
                            ? e => startRefresh()
                            : undefined
                    }
                >
                    <Text
                        style={[
                            preResultHomeStyle.preHomeBottomText,
                            preResultHomeStyle.preHomeTopText,
                        ]}
                    >
                        🏠
                    </Text>
                    <br/>
                    <br/>
                    <Text
                        style={[
                            preResultHomeStyle.preHomeBottomText,
                        ]}
                    >
                        {homeText}
                    </Text>
                </Button>
            }

            onEndReached={() => {
                //startRefresh();
            }}

            ListFooterComponent={
                Platform.OS == "web"
                    ? loading
                        ? <Surface
                            style={shelvesStyle.scrollContainer}
                        >
                            <ActivityIndicator
                                size="large"
                            />
                        </Surface>

                        : <Button
                            onPress={() => startRefresh()}
                            mode="contained"
                        >
                            Refresh
                            </Button>

                    : undefined
            }

            renderItem={({item}) => 
                <Section
                    section={item}
                    type="horizontal"
                />
            }

            refreshing={loading}
            onRefresh={
                Platform.OS != "web"
                    ? () => startRefresh()
                    : undefined
            }

            ListFooterComponentStyle={
                sections.length == 0 
                ? {display: "none"}
                : {paddingBottom: 20}
            }

            data={sections}
            keyExtractor={item => item.title}
        />
    </Surface>
};