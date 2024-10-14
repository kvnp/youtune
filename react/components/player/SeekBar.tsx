import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Slider } from '@miblanchard/react-native-slider';
import Music from '../../services/music/Music';

function pad(n: number | string, width: number, z: string = "0") {
    n = n + '';
    return n.length >= width
        ? n
        : new Array(width - n.length + 1).join(z) + n;
}

const minutesAndSeconds = (position: number) => ([
    pad( ~~(position / 60), 2),
    pad( ~~(position % 60), 2),
]);


export default function SeekBar({buffering, style, buttonColor, thumbColor, fontColor}) {
    const { colors } = useTheme();
    const { duration } = Music.metadata;
    const [position, setPosition] = useState(Music.position);
    const [state, setState] = useState({
        isSliding: false,
        cache: 0
    });

    const realPosition = state.isSliding != true
        ? position
        : state.cache

    const elapsed = minutesAndSeconds(realPosition);
    const remaining = minutesAndSeconds(duration - realPosition);

    useEffect(() => {
        const listener = Music.addListener(
            Music.EVENT_POSITION_UPDATE,
            pos => setPosition(pos)
        );

        return () => listener.remove();
    }, []);

    return <View style={[styles.container, style]}>
        <Slider
            onSlidingComplete={position => {
                Music.seekTo(position[0]);
                setState({
                    isSliding: false,
                    cache: 0
                });
            }}

            onValueChange={value => {
                if (state.isSliding) {
                    setState({
                        isSliding: true,
                        cache: value[0]
                    });
                }
            }}
            
            onSlidingStart={currentPosition => {
                setState({
                    isSliding: true,
                    cache: currentPosition[0]
                });
            }}
            
            value={realPosition}
            maximumValue={duration}
            minimumTrackTintColor={colors.text}
            maximumTrackTintColor={colors.card}
            thumbTintColor={colors.primary}
            thumbStyle={{color: thumbColor}}
            trackStyle={styles.track}
            tapToSeek={true}
        />

        <View style={{ flexDirection: 'row', paddingRight: 15, paddingLeft: 15 }}>
            <Text style={[styles.text, {color: fontColor}]}>
                {elapsed[0] + ':' + elapsed[1]}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.text, {textAlign: 'right', color: fontColor}]}>
                {'-' + remaining[0] + ':' + remaining[1]}
            </Text>
        </View>
    </View>
};

const styles = StyleSheet.create({
    slider: {
        marginTop: -12
    },

    container: {
        paddingTop: 16
    },

    track: {
        height: 2,
        borderRadius: 1
    },

    text: Platform.OS == 'ios'
    ? {
        fontSize: 12,
        textAlign: 'center',
        marginLeft: -14,
        marginRight: -14
    }

    : {
        fontSize: 13,
        textAlign: 'center'
    }
});