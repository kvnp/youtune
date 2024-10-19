import { Platform } from "react-native";

export const displayNotification = Platform.OS == 'web'
    ? ({title, text, icon}) => {
        if (!window.Notification)
            return
            
        if (Notification.permission == 'granted') {
            navigator.serviceWorker.getRegistration().then(function(reg) {
                var options = {
                    body: text,
                    icon: icon,
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: 1
                    }
                };
                
                reg.showNotification(title, options);
            });
        }
    }

    : () => {

    }