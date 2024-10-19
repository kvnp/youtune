import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';

import { Slider } from '@miblanchard/react-native-slider';
import Music from '../../services/music/Music';


const SeekBar = ({style, thumbColor, fontColor, buttonColor}: {style: CSSStyleDeclaration, thumbColor: string, fontColor: string, buttonColor: string}) => {
    const { duration } = Music.metadata;
    const [position, setPosition] = useState(Music.position);
    const [sliderStyle, setSliderStyle] = useState({trackHeight: 5, thumbWidth: 20, thumbMargin: 0, thumbBorderRadius: 10});

    const [isSliding, setSliding] = useState(false);
    const cache = useRef<number>(0);

    const pad = (n: number, width: number, z = '0') => {
        let s = n + '';
        return s.length >= width
            ? s
            : new Array(width - s.length + 1).join(z) + n;
    }

    const minutesAndSeconds = useCallback((position: number) => ([
        pad( ~~(position / 60), 2),
        pad( ~~(position % 60), 2),
    ].join(":")), []);

    const slider = useRef<HTMLElement | null>(null);
    const leftBar = useRef<HTMLElement | null>(null);
    const rightBar = useRef<HTMLElement | null>(null);
    const thumb = useRef<HTMLElement | null>(null);

    const currentPosition = useRef<HTMLElement | null>(null);
    const remainingPosition = useRef<HTMLElement | null>(null);

    const realPosition = isSliding != true
        ? position
        : cache.current;

    const elapsed = minutesAndSeconds(realPosition);
    const remaining = "-" + minutesAndSeconds(duration - realPosition);
    const container = useRef<HTMLElement>(null);

    useEffect(() => {
        if (container.current == null)
            return;

        let positions = container.current.childNodes[1] as HTMLElement;

        currentPosition.current = positions.childNodes[0] as HTMLElement;
        remainingPosition.current = positions.childNodes[2] as HTMLElement;

        /*slider.current = container.current.childNodes[0] as HTMLElement;
        leftBar.current = slider.current.childNodes[0] as HTMLElement;
        rightBar.current = slider.current.childNodes[2] as HTMLElement;
        thumb.current = slider.current.childNodes[1] as HTMLElement;

        leftBar.current.style.borderRadius = "";
        leftBar.current.style.borderBottomRightRadius = "0px";
        leftBar.current.style.borderTopRightRadius = "0px";
        rightBar.current.style.borderRadius = "";
        rightBar.current.style.borderBottomLeftRadius = "0px";
        rightBar.current.style.borderTopLeftRadius = "0px";


        leftBar.current.style.transition = "height .3s, border-radius .3s, flex-grow .3s";
        rightBar.current.style.transition = "height .3s, border-radius .3s, flex-grow .3s";
        thumb.current.style.transition = "width .3s, border-radius .3s";

        const enter = (e: TouchEvent | MouseEvent) => {
            setSliderStyle({trackHeight: 20, thumbWidth: 8, thumbMargin: -8, thumbBorderRadius: 0});
            e.preventDefault();
        };

        const leave = (e: TouchEvent | MouseEvent) => {
            setSliderStyle({trackHeight: 5, thumbWidth: 20, thumbMargin: 0, thumbBorderRadius: 10});
            e.preventDefault();
        }

        container.current.onmouseenter = enter;
        container.current.ontouchstart = enter;
        container.current.onmouseleave = leave;
        container.current.ontouchend = leave;*/
    }, []);

    useEffect(() => {
        const listener = Music.addListener(
            Music.EVENT_POSITION_UPDATE,
            pos => {
                if (isSliding)
                    return;
                
                setPosition(pos);
            }
        );

        return () => listener.remove();
    }, []);
    
    //@ts-ignore
    return <View ref={container} style={[styles.container, style]}>
        <Slider
            onSlidingComplete={position => {
                /*leftBar.current.style.transition = "height .3s, flex-grow .3s";
                rightBar.current.style.transition = "height .3s, flex-grow .3s";*/
                Music.seekTo(position[0]);
                setSliding(false);
                cache.current = 0;
            }}

            onValueChange={value => {
                if (isSliding)
                    setSliding(true);
                
                cache.current = value[0];
                currentPosition.current!.innerText = minutesAndSeconds(value[0]);
                remainingPosition.current!.innerText = "-" + minutesAndSeconds(duration - value[0]);
            }}
            
            onSlidingStart={_currentPosition => {
                /*leftBar.style.transition = "height .3s";
                rightBar.style.transition = "height .3s";*/
                setSliding(true);
            }}
            
            value={realPosition}
            maximumValue={duration}
            minimumTrackTintColor={fontColor}
            maximumTrackTintColor={buttonColor}
            thumbTintColor={thumbColor}

            //@ts-ignore
            trackHeight={sliderStyle.trackHeight}
            thumbStyle={{
                color: thumbColor,
                width: sliderStyle.thumbWidth,
                marginLeft: sliderStyle.thumbMargin,
                marginRight: sliderStyle.thumbMargin,
                borderRadius: sliderStyle.thumbBorderRadius
            }}
        />

        <View style={{ flexDirection: 'row', paddingRight: 15, paddingLeft: 15 }}>
            <Text style={[styles.text, {color: fontColor} as TextStyle]}>
                {elapsed}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.text, {textAlign: 'right', color: fontColor} as TextStyle]}>
                {remaining}
            </Text>
        </View>
    </View>
};

const styles = StyleSheet.create({
    slider: {marginTop: -12},
    container: {paddingTop: 16},
    track: {borderRadius: 1},
    text: {
        fontSize: 13,
        textAlign: 'center'
    }
});

export default SeekBar;