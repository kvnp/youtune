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
import Shelf from '../../components/shared/Shelf';
import { shelvesStyle } from '../../styles/Shelves';
import { preResultHomeStyle } from '../../styles/Home';

export default function HomeTab({navigation}) {
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const [homeText, setHomeText] = useState(
        Platform.OS == "web"
            ? "Press the home icon to load"
            : "Pull down to load"
    );

    useEffect(() => {
        if (shelves.length == 0)
            startRefresh();
    }, []);

    const startRefresh = () => {
        API.initialize()
            .then(() => {
                setShelves(API.initialData.shelves);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }

    return <FlatList
        style={shelvesStyle.scrollView}
        contentContainerStyle={shelvesStyle.scrollContainer}

        ListEmptyComponent={
            loading
            ? <View style={[shelvesStyle.scrollView, shelvesStyle.scrollContainer]}>
                <ActivityIndicator color={colors.text} size="large"/>
            </View>

            : <Pressable onPress={Platform.OS == "web" ? () => startRefresh() :null}>
                <Text style={[preResultHomeStyle.preHomeBottomText, preResultHomeStyle.preHomeTopText, {color: colors.text}]}>🏠</Text>
                <Text style={[preResultHomeStyle.preHomeBottomText, {color: colors.text}]}>
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
                    ? <View style={[shelvesStyle.scrollView, shelvesStyle.scrollContainer]}>
                        <ActivityIndicator color={colors.text} size="large"/>
                    </View>

                    : <Button style={{marginHorizontal: 50}} onPress={() => startRefresh()} mode="outlined">
                        <Text style={{color: colors.text}}>Refresh</Text>
                    </Button>

                : undefined
        }

        progressViewOffset={0}

        renderItem={({item}) => <Shelf shelf={item} navigation={navigation}/>}

        refreshing={loading}
        onRefresh={
            Platform.OS != "web"
                ? () => startRefresh()
                : undefined
        }

        ListFooterComponentStyle={
            shelves.length == 0 
            ? {display: "none"}
            : {paddingBottom: 20}
        }

        data={shelves}
        keyExtractor={item => item.title}
    />
};