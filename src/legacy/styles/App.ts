import { StyleSheet, Platform } from 'react-native';

const colorStyle = {
    darkgray: {color: "darkgray"},
    white: {color: "white"},
};

export const appColor = {
    background: {
        //backgroundColor: '#694fad'
        backgroundColor: 'darkslategray'
    }
};

export const headerStyle = StyleSheet.create({
    headerPicture: {
        width: '100%',
        height: "20%"
    },

    headerHeight: {
        height: "20%"
    },

    image: {
        backgroundColor: appColor.background.backgroundColor
    },

    imageFound: {
        backgroundColor: "transparent"
    },

    imageStyle: {},

    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    gradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },

    text: {
        fontSize: 45,
        fontWeight: 'bold'
    }
});

export const textStyle = StyleSheet.create({
    text: {
        color: colorStyle.white.color
    },

    placeholder: {
        color: colorStyle.darkgray.color
    }
});