import { useState, useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const ScrollingText = ({children, style}) => {
    const [containerWidth, setContainerWidth] = useState(-1);
    const [contentWidth, setContentWidth] = useState(-1);

    const scrollAnim = useRef(new Animated.Value(0)).current;
    const scrollInterpolation = scrollAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [100, -100]
    });

    useEffect(() => {
        if (isOverflowing()) {
            scrollAnim.setValue(0);
            startAnimation(1, 2000);
        } else {
            stopAnimation();
        }
    }, [contentWidth, containerWidth, scrollAnim]);

    const startAnimation = (toValue, delay) => {
        Animated.timing(scrollAnim, {
            toValue: toValue,
            duration: 10000,
            delay: delay,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(({finished}) => {
            if (finished && isOverflowing()) {
                scrollAnim.setValue(-containerWidth/contentWidth);
                startAnimation(1, 0);
            }
        });
    }

    const stopAnimation = () => {
        scrollAnim.setValue(0);
        Animated.timing(scrollAnim, {
            toValue: 0,
            duration: 0,
            delay: 0,
            easing: Easing.linear,
            useNativeDriver: true
        }).start();
    }

    const areWidthsNotDefined = () => {
        return (contentWidth == -1 || containerWidth == -1);
    }

    const isOverflowing = () => {
        return areWidthsNotDefined()
            ? false
            : contentWidth > containerWidth;
    }

    return <View
        style={[{overflow: "hidden", width: "100%"}, style]}
        onLayout={
            e => setContainerWidth(e.nativeEvent.layout.width)
        }
    >
        <Animated.ScrollView
            onContentSizeChange={
                width => setContentWidth(width)
            }

            style={{
                alignSelf: isOverflowing()
                    ? "flex-start"
                    : "center",
                transform: [{translateX: scrollInterpolation}]
            }}
        >
            <View
                style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    width: "auto"
                }}
            >
                {children}
            </View>
        </Animated.ScrollView>
    </View>;
}

export default ScrollingText;