import { useEffect, useState } from 'react';

import {
    Text,
    Pressable,
    View,
    ActivityIndicator,
    Platform,
    FlatList
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Button } from 'react-native-paper';

import API from '../../services/api/API';
import Section from '../../components/collections/Section';
import { shelvesStyle } from '../../styles/Shelves';
import { preResultHomeStyle } from '../../styles/Home';
import { HomeSection } from 'ytmusic-api';

export default function HomeTab({navigation}: {navigation: any}) {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const [homeText, setHomeText] = useState(
        Platform.OS == "web"
            ? "Press the home icon to load"
            : "Pull down to load"
    );

    const startRefresh = () => {
        API.initialize()
            .then(() => {
                setSections(API.YTMusic.getInitialHomeSections());
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        startRefresh();
    }, []);

    return <FlatList
        contentContainerStyle={shelvesStyle.scrollContainer}

        ListEmptyComponent={
            loading
            ? <View
                style={shelvesStyle.scrollContainer}
            >
                <ActivityIndicator
                    color={colors.text}
                    size="large"
                />
            </View>

            : <Pressable
                onPress={
                    Platform.OS == "web"
                        ? () => startRefresh()
                        : null
                }
            >
                <Text
                    style={[
                        preResultHomeStyle.preHomeBottomText,
                        preResultHomeStyle.preHomeTopText,
                        {color: colors.text}
                    ]}
                >
                    🏠
                </Text>
                <Text
                    style={[
                        preResultHomeStyle.preHomeBottomText,
                        {color: colors.text}
                    ]}
                >
                    {homeText}
                </Text>
            </Pressable>
        }

        onEndReached={() => {
            //startRefresh();
        }}

        ListFooterComponent={
            Platform.OS == "web"
                ? loading
                    ? <View
                        style={shelvesStyle.scrollContainer}
                    >
                        <ActivityIndicator
                            color={colors.text}
                            size="large"
                        />
                    </View>

                    : <Button
                        style={{marginHorizontal: 50}}
                        onPress={() => startRefresh()}
                        mode="outlined"
                    >
                        <Text style={{color: colors.text}}>Refresh</Text>
                    </Button>

                : undefined
        }

        progressViewOffset={0}

        renderItem={({item}) => 
            <Section
                section={item}
                type="horizontal"
                navigation={navigation}
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
};