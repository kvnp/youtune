import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

export const getIcon = ({title, color}) => {
    if (color == undefined) {
        const { colors } = useTheme();
        color = colors.text;
    }

    return <MaterialIcons name={title} color={color} size={25}/>;
}