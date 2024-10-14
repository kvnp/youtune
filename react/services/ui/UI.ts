import { DeviceEventEmitter, StatusBar } from "react-native";
import { enableScreens } from "react-native-screens";

import Settings from "../device/Settings";

export default class UI {
    static #emitter = DeviceEventEmitter;
    static EVENT_DARK = "event-dark";
    static EVENT_HEADER = "event-header";

    static initialize() {
        enableScreens(true);
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor("transparent", true);
    }

    static setDarkMode = boolean => {
        StatusBar.setBarStyle(
            boolean ? "light-content" : "dark-content",
            true
        );

        UI.#emitter.emit(UI.EVENT_DARK, boolean);
    };

    static Header = {
        source: null
    };

    static setHeader = ({url}) => {
        if (url == undefined || UI.Header.source?.uri == url)
            return;
        
        UI.Header.source = {uri: url};
        UI.#emitter.emit(UI.EVENT_HEADER, UI.Header);
        Settings.setHeaderState(UI.Header);
    }

    static addListener(event: string, listener: (data: any) => void): EmitterSubscription {
        return UI.#emitter.addListener(event, listener);
    }
}