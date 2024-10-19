export default class Device {
    static Language;
    static Platform = (() => {
        let platform;
        if (typeof process !== "undefined") {
            if (process?.versions) {
                if (process.versions?.node) {
                    platform = "node";
                }
            }
        }
        
        if (!platform)
            platform = require("react-native")["Platform"].OS;

        let deviceLanguage;
        if (platform == "web") {
            deviceLanguage = (navigator.language || navigator.userLanguage).split("-")

            if (deviceLanguage.length == 1)
                if (navigator.languages.length > 1)
                    if (navigator.languages[1].includes("-"))
                        deviceLanguage.push(navigator.languages[1].split("-")[1]);

        } else if (platform == "android")
            deviceLanguage = require("react-native")
                .NativeModules
                .I18nManager
                .localeIdentifier;
            
        else if (platform == "ios")
            deviceLanguage = require("react-native")
                    .NativeModules
                    .SettingsManager
                    .settings
                    .AppleLocale
                || require("react-native")
                    .NativeModules
                    .SettingsManager
                    .settings
                    .AppleLanguages[0];

        else if (platform == "node")
            deviceLanguage = Intl
                .DateTimeFormat()
                .resolvedOptions()
                .locale
                .split("-");
        
        this.Language = {
            hl: deviceLanguage[0],
            gl: deviceLanguage[1]
        };
        
        return platform;
    })();
}