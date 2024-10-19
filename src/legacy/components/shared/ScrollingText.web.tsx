import { useState, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

const ScrollingText = ({children, style}) => {
    const [containerWidth, setContainerWidth] = useState(-1);
    const [contentWidth, setContentWidth] = useState(-1);
    const viewRef = useRef(null);

    useEffect(() => {
        let textNode = viewRef.current.children[0].children[0].children[0];
        textNode.style.whiteSpace = "nowrap";
    }, []);

    useEffect(() => {
        if (isOverflowing())
            startAnimation();
        else
            stopAnimation();
    }, [contentWidth, containerWidth]);

    const cancel = () => {
        for (let animation of viewRef.current.getAnimations())
            animation.cancel();
    }

    const startAnimation = () => {
        viewRef.current.style.alignSelf = "flex-start";
        cancel();

        viewRef.current.animate(
            [
                {transform: `translateX(${containerWidth/contentWidth*100}%)`},
                {transform: "translateX(-100%)"}
            ],
            {
                duration: viewRef.current.innerText.length * 400,
                iterations: Infinity,
                delay: 2000,
                iterationStart: (containerWidth/contentWidth) / (containerWidth/contentWidth + 1)
            }
        );
    }

    const stopAnimation = () => {
        viewRef.current.style.alignSelf = "center";
        cancel();
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
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
        <ScrollView
            ref={viewRef}
            onContentSizeChange={width => setContentWidth(width)}
        >
            <View style={{
                alignSelf: "center",
                justifyContent: "center",
                width: "auto"
            }}>
                {children}
            </View>
        </ScrollView>
    </View>;
}

export default ScrollingText;