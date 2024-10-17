import { DeviceEventEmitter } from "react-native";
import API from "../api/API";
import UI from "../ui/UI";
import IO from "./IO";
import Storage from "./storage/Storage";

export default class Settings {
    static initialized = false;
    static initialize() {
        return new Promise(async(resolve, reject) => {
            if (this.initialized)
                return resolve(true);

            let keys = Object.keys(this.Values);
            for (let i = 0; i < keys.length; i++) {
                let result = await Storage.getItem("Settings", keys[i]);
                if (result !== undefined && result !== null)
                    this.Values[keys[i]] = result.value;
            }
            
            this.#emitter.emit(this.EVENT_INITIALIZE, undefined);
            this.#emitter.emit(this.EVENT_SETTINGS, this.Values);
            this.initialized = true;
            resolve(true);
        });
    }

    static waitForInitialization() {
        return new Promise((resolve, reject) => {
            if (this.initialized)
                return resolve();

            let eventListener = this.addListener(
                this.EVENT_INITIALIZE, e => {
                    resolve();
                    eventListener.remove();
                }
            );
        });
    }

    static #emitter = DeviceEventEmitter;
    static EVENT_SETTINGS = "event-settings-values";
    static EVENT_INITIALIZE = "event-settings-initialize";

    static addListener(event: string, listener: (data: any) => void): EmitterSubscription {
        return this.#emitter.addListener(event, listener);
    }

    static #storeSetting(key) {
        let data = {
            setting: key,
            value: this.Values[key]
        };

        this.#emitter.emit(this.EVENT_SETTINGS, this.Values);
        return Storage.setItem("Settings", data);
    }

    static Values = {
        transmitLanguage: false,
        proxyYTM: false,
        proxyYTMM: false,
        safetyMode: true,
        darkMode: true,
        headerState: null,
        visualizer: false
    }

    static enableLanguageTransmission(boolean) {
        if (boolean != this.Values.transmitLanguage) {
            this.Values.transmitLanguage = boolean;
            this.#storeSetting("transmitLanguage");
        }
    }
    
    static enableProxy(boolean) {
        if (boolean != this.Values.proxyYTM) {
            this.Values.proxyYTM = boolean;
            this.#storeSetting("proxyYTM");
        }
    }

    static enableProxyM(boolean) {
        if (boolean != this.Values.proxyYTMM) {
            this.Values.proxyYTMM = boolean;
            this.#storeSetting("proxyYTMM");
        }
    }
    
    static enableSafetyMode(boolean) {
        if (boolean != this.Values.safetyMode) {
            this.Values.safetyMode = boolean;
            this.#storeSetting("safetyMode");
        }
    }
    
    static enableDarkMode(boolean) {
        if (boolean != this.Values.darkMode) {
            UI.setDarkMode(boolean);
            this.Values.darkMode = boolean;
            this.#storeSetting("darkMode");
        }
    }

    static setHeaderState(state) {
        if (this.Values.headerState != state) {
            if (IO.isBlob(state.source.uri)) {
                // this.#storeSetting("headerState");

            } else {
                // API.getBlob({url: state.source.uri})
                //     .then(result => {
                //         state.source.uri = result;
                //         this.Values.headerState = state;
                //         this.#storeSetting("headerState");
                //     });
            }
        }   
    }

    static enableAudioVisualizer(boolean) {
        this.Values.visualizer = boolean;
        this.#storeSetting("visualizer");
    }
}