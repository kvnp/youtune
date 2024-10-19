import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { navigationOptions } from '../../../App.tsx.bak';
import Playlists from '../library/Playlists';
import Albums from '../library/Albums';
import Artists from '../library/Artists';
import Downloads from '../library/Downloads';
import { getIcon } from '../../components/shared/Icon';

const Tab = createMaterialTopTabNavigator();
const tabOptions = {};

export default function LibraryTab() {
    return <Tab.Navigator initialRouteName="Playlists" tabBarPosition="bottom" screenOptions={{...navigationOptions, ...tabOptions}}>
        <Tab.Screen name="Playlists" component={Playlists} options={{ tabBarIcon: ({ color }) => getIcon({title: "playlist-play", color}) }}/>
        <Tab.Screen name="Albums" component={Albums} options={{ tabBarIcon: ({ color }) => getIcon({title: "album", color}) }}/>
        <Tab.Screen name="Artists" component={Artists} options={{ tabBarIcon: ({ color }) => getIcon({title: "people", color}) }}/>
        <Tab.Screen name="Downloads" component={Downloads} options={{ tabBarIcon: ({ color }) => getIcon({title: "file-download", color}) }}/>
    </Tab.Navigator>
};