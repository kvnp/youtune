import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { Snackbar } from 'react-native-paper';

const UpdateBar = () => {
    const [visible, setVisible] = useState(false);
    const [state, setState] = useState<{message: String | null, label: String | null, onPress: () => void}>({
        message: null,
        label: null,
        onPress: null
    });

    useEffect(() => {
        if (Platform.OS == "web") {
            const isUpdateAvailable = window['isUpdateAvailable'];
            if (isUpdateAvailable)
                isUpdateAvailable.then((isAvailable: boolean) => {
                    if (isAvailable) {
                        setState({
                            message: "An update is availabe!",
                            label: "Reload",
                            onPress: () => location.reload()
                        });

                        setVisible(true);
                    }
                });
        }
    }, []);

    return <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={{bottom: 50, maxWidth: 800, alignSelf: "center", width: "100%"}}
        action={{
            label: state.label,
            onPress: () => state.onPress(),
        }}
    >
        {state.message}
    </Snackbar>;
}

export default UpdateBar;