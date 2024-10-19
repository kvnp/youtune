import { useState, useEffect, useRef } from "react";
import { View } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { State } from 'react-native-track-player';

import SearchTab from "../tabs/SearchTab";
import HomeTab from "../tabs/HomeTab";
import LibraryTab from "../tabs/LibraryTab";
import SettingsTab from "../tabs/SettingsTab";

import Music from "../../services/music/Music";

import { navigationOptions } from "../../../App.tsx.bak";
import { getIcon } from "../../components/shared/Icon";
import { headerStyle } from "../../styles/App";
import Header from "../../components/overlay/Header";
import MiniPlayer from "../../components/player/MiniPlayer";

const getTabOptions = title => {
    return { tabBarIcon: ({ color }) => getIcon({title, color}) };
}

const Nav = createMaterialTopTabNavigator();
const tabOptions = {
    lazy: false,
    optimizationsEnabled: true,
    tabBarHideOnKeyboards: true,
    tabBarShowLabel: false,
    gestureEnabled: true,
    swipeEnabled: true,
    animationEnabled: true
};

const getHeight = state => [State.Stopped, State.None].includes(state) ? 0 : 50;

export default function Navigator() {
    const [marginBottom, setMarginBottom] = useState(getHeight(Music.state));
    const [headerTitle, setHeaderTitle] = useState(null);
    
    useEffect(() => {
        const stateListener = Music.addListener(
            Music.EVENT_STATE_UPDATE,
            state => setMarginBottom(getHeight(state))
        );

        return () => stateListener.remove();
    }, []);

    return <>
        <Header style={headerStyle.headerPicture} title={headerTitle}/>
        <Nav.Navigator tabBarPosition="bottom"
            sceneAnimationEnabled={true} shifting={true} labeled={true}
            sceneContainerStyle={{marginBottom: marginBottom}}
            screenOptions={{...tabOptions, ...navigationOptions}}
            screenListeners={({route}) => setHeaderTitle(route.name)}
        >
            <Nav.Screen name="Home" component={HomeTab} options={getTabOptions("home")}/>
            <Nav.Screen name="Search" component={SearchTab} options={getTabOptions("search")}/>
            <Nav.Screen name="Library" component={LibraryTab} options={getTabOptions("folder")}/>
            <Nav.Screen name="Settings" component={SettingsTab} options={getTabOptions("settings")}/>
        </Nav.Navigator>
        <MiniPlayer
            containerStyle={{position: "absolute", bottom: 48, width: "100%", height: marginBottom}}
            style={{maxWidth: 800}}
        />
    </>
}