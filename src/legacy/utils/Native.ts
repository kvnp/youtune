import { NativeModules, Platform } from 'react-native';

const deviceLanguage = Platform.OS == "web"
        ? null

        : Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13

            : NativeModules.I18nManager.localeIdentifier;

var gl: string = Platform.OS != "web"
    ? deviceLanguage.split("_")[1]
    : navigator.language.split("-")[1];

var hl: string = Platform.OS != "web"
    ? deviceLanguage.split("_")[0]
    : navigator.language.split("-")[0]

if (gl == "CN") gl = "TW"
if (hl == "yue") hl = "zh"

export function getGL(): string {
    return gl;
}

export function getHL(): string {
    return hl;
}