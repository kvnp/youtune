import { StyleSheet } from 'react-native';
import { appColor } from './App';

export const artistGradient = [
    "rgba(0, 0, 0, 0.2)",
    "rgba(0, 0, 0, 0.6)"
];

export const bottomBarStyle = StyleSheet.create({
    container: {
        backgroundColor: appColor.background.backgroundColor,
        width: '100%',
        height: 130,
    },

    topRow: {
        flexDirection: 'row',
        alignSelf: "stretch",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "space-evenly",
        paddingTop: 10,
    },

    topLeftPadding: {
        flexGrow: 1
    },

    closeButton: {
        width: 40,
        height: 40,
        
        borderRadius: 20,
        alignSelf: 'center',
        alignItems: "center",
        justifyContent: "center"
    },

    closeButtonText: {
        fontSize: 15,
    },

    button: {
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: 5,
        zIndex: 10
    },

    buttonText: {
        fontWeight: 'bold'
    },

    artistColumn: {
        marginRight: 40,
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },

    artistGradientStyle: {
        width: "100%",
        height: "100%",
    },

    artistName: {
        fontWeight: 'bold',
        fontSize: 25
    },

    subscribeArtist: {
        alignSelf: 'baseline',
        backgroundColor: 'red',
        fontWeight: 'bold',
        marginTop: 5,
        paddingRight: 5,
        paddingLeft: 5,
        borderRadius: 5,
    },
});

export const bottomBarAlbumStyle = StyleSheet.create({
    albumCover: {
        backgroundColor: appColor.background.backgroundColor,
        height: 70,
        width: 70
    },

    albumTitle: {

    },

    albumSubtitle: {

    },

    albumInfo: {
        
    },

    albumText: {
        fontWeight: "bold"
    }
});

