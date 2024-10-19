import { useEffect, useState, useRef } from 'react';
import { Text } from "react-native";
import { useTheme } from '@react-navigation/native';

import UI from '../../services/ui/UI';
import { headerStyle } from '../../styles/App';

const gradientColors = "linear-gradient(rgba(242, 242, 242, 0.2),rgba(242, 242, 242, 0.5),rgba(242, 242, 242, 0.8),rgba(242, 242, 242, 1))";
const gradientColorsDark = "linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.8),rgba(0, 0, 0, 1))";

export default function Header({style, title}) {
    const [header, setState] = useState({source: {uri: null}});
    const { dark, colors } = useTheme();
    const container = useRef(null);
    const image = useRef(null);
    
    useEffect(() => {
        const headerListener = UI.addListener(UI.EVENT_HEADER, state => setState({source: {uri: state?.source.uri}}));
        return () => headerListener.remove();
    }, []);

    useEffect(() => {
        image.current.style.opacity = 0;
        setTimeout(() => image.current.src = header.source.uri, 400);
    }, [header]);

    return <div ref={container} style={{display: "flex", ...headerStyle.container, ...style}}>
        <img ref={image} loading="lazy" onLoad={e => e.target.style.opacity = 1} style={{objectFit: "cover", height: "inherit", width: "inherit", position: "absolute", opacity: 0, transition: "opacity .4s ease-in"}}></img>
        <Text style={{color: colors.text, backgroundImage: dark ? gradientColorsDark : gradientColors, ...headerStyle.text, display: "flex", height: "inherit", width: "inherit", alignItems: "center", justifyContent: "center", position: "absolute"}}>
            {title}
        </Text>
    </div>
}