import { StyleSheet, Platform } from 'react-native';

export const refreshStyle = StyleSheet.create({
    button: {
        bottom: 5,
        paddingRight: 15,
        paddingLeft: 15,
        paddingBottom: 5,
        paddingTop: 5,
        borderRadius: 20,
        alignSelf: 'center',
        justifyContent: 'center'
    },

    buttonText: {
        color: 'white'
    }
});

export const preResultHomeStyle = StyleSheet.create({
    preHomeTopText: {
        fontSize: 50,
        paddingBottom: 50
    },

    preHomeBottomText: {
        fontSize: 20,
        textAlign: "center",
        alignSelf: "center"
    },
});

export const resultHomeStyle = StyleSheet.create({
    homeText: {
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: "left"
    },

    textView: {
        paddingLeft: 20,
        paddingTop: 20
    }
});

export const albumStyle = StyleSheet.create({
    albumCollection: {
        paddingTop: Platform.OS == "web" ?10 :0,
        paddingBottom: 5,
        marginBottom: 25
    },

    album: {
        marginRight: 20
    },

    albumCover: {
        height: 100,
        width: 100,
        backgroundColor: 'gray'
    }
});

export const mainStyle = StyleSheet.create({
    homeView: {
        flexGrow: 1,
        width: '100%'
    },
});