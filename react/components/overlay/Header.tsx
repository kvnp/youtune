import { useEffect, useState } from 'react';
import { ImageBackground, Text } from "react-native";
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import UI from '../../services/ui/UI';
import { headerStyle } from '../../styles/App';

export default function Header({style, title}) {
    const [header, setState] = useState({source: null});
    const { dark, colors } = useTheme();

    useEffect(() => {
        const headerListener = UI.addListener(
            UI.EVENT_HEADER,
            state => setState({source: {uri: state?.source.uri}})
        );

        return () => headerListener.remove();
    }, []);

    return (
        <ImageBackground style={[headerStyle.container, style]}
                         imageStyle={{height: "100%", position: "absolute"}}
                         source={header.source}>
            <LinearGradient style={[headerStyle.gradient, header.source == null ? {backgroundColor: colors.card} :headerStyle.imageFound]}
                            colors={
                                dark ? gradientColorsDark
                                     : gradientColors
                            }>
                <Text style={[headerStyle.text, {color: colors.text}]}>
                    {title}
                </Text>
            </LinearGradient>
        </ImageBackground>
    )
}

const gradientColors = ['rgba(242, 242, 242, 0.2)', 'rgba(242, 242, 242, 0.5)', 'rgba(242, 242, 242, 0.8)', 'rgba(242, 242, 242, 1)'];
const gradientColorsDark = ['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 1)'];