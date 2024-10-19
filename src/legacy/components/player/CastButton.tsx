import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Button } from "react-native-paper"
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Cast from "../../services/music/Cast";
import { showStreamModal } from "../modals/StreamModal";
import { ColorValue, StyleProp, ViewStyle } from "react-native";

const CastButton = ({style, labelStyle, contentStyle, iconStyle, color}: {style: StyleProp<ViewStyle>, labelStyle: StyleProp<ViewStyle>, contentStyle: StyleProp<ViewStyle>, iconStyle: StyleProp<ViewStyle>, color: number | ColorValue | undefined}) => {
    const {colors} = useTheme();
    const [state, setState] = useState({
        connected: false, connecting: false
    });

    useEffect(() => {
        const castListener = Cast.addListener(Cast.EVENT_CAST, e => {
            if (e.castState == "NOT_CONNECTED")
                setState({connected: false, connecting: false});
            else if (e.castState == "CONNECTED")
                setState({connected: true, connecting: false});
            else if (e.castState == "CONNECTING")
                setState({connected: false, connecting: true});
        });

        return () => castListener.remove();
    }, []);

    return <Button
        onPress={!state.connected ? Cast.cast : Cast.disconnect}
        onLongPress={state.connected ? showStreamModal : undefined}
        labelStyle={labelStyle}
        style={style}
        contentStyle={contentStyle}
    >
        <MaterialIcons
            name={state.connected ? "cast-connected" : "cast"}
            selectable={false}
            size={30}
            style={iconStyle}
            color={
                state.connecting
                    ? "blue"
                    : color
                        ? color
                        : colors.text
            }
        />
    </Button>
}

export default CastButton;