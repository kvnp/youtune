import { useState, useEffect, useRef } from "react";
import { Provider } from 'react-native-paper';
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import PlayView from "./react/views/full/PlayView";
import PlaylistView from "./react/views/full/PlaylistView";
import ArtistView from "./react/views/full/ArtistView";
import Navigator from "./react/views/full/Navigator";
import CaptchaView from "./react/views/full/CaptchaView";

import { getTheme, linking } from "./react/Config";
import { getIcon } from "./react/components/shared/Icon";
import UpdateBar from "./react/components/shared/UpdateBar";
import MoreModal from "./react/components/modals/MoreModal";
import StreamModal from "./react/components/modals/StreamModal";
import UI from "./react/services/ui/UI";
import Settings from "./react/services/device/Settings";
import Downloads from "./react/services/device/Downloads";
import Music from "./react/services/music/Music";

export const navigationOptions = {
  headerTitle: null,
  headerShown: false
};

const Stack = createStackNavigator();

export default function App() {
  const [dark, setDark] = useState(Settings.Values.darkMode);
  const theme = getTheme(dark);
  const navigationRef = useRef(null);

  useEffect(() => {
    UI.initialize();
    Downloads.initialize();
    Music.initialize();
    Settings.initialize().then(() => {
      UI.setDarkMode(Settings.Values.darkMode);
      UI.setHeader({ url: Settings.Values.headerState?.source.uri });
    });
    const darkmodeListener = UI.addListener(
      UI.EVENT_DARK,
      boolean => setDark(boolean)
    );

    return () => darkmodeListener.remove();
  }, []);

  return <Provider theme={theme}>
    <NavigationContainer ref={navigationRef} linking={linking} theme={theme}>
      <Stack.Navigator screenOptions={{ gestureEnabled: true, swipeEnabled: true, animationEnabled: true }}>
        <Stack.Screen name="App" component={Navigator}
          options={navigationOptions} />

        <Stack.Screen name="Music" component={PlayView}
          options={{ ...navigationOptions, presentation: "transparentModal" }} />

        <Stack.Screen name="Playlist" component={PlaylistView}
          options={{ headerBackImage: () => getIcon({ title: "arrow-back" }) }} />

        <Stack.Screen name="Artist" component={ArtistView}
          options={{ headerBackImage: () => getIcon({ title: "arrow-back" }) }} />

        <Stack.Screen name="Captcha" component={CaptchaView} />
      </Stack.Navigator>
      <UpdateBar />
      <MoreModal navigation={navigationRef.current} />
      <StreamModal />
    </NavigationContainer>
  </Provider>;
}