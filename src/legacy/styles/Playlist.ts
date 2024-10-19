import { StyleSheet } from 'react-native';

export const playlistStyle = StyleSheet.create({
    container: {
        height: 220,
        width: 150,
    },

    cover: {
        alignItems:'center',
        justifyContent:'center',
        height: 150,
        width: 150,
        backgroundColor: 'gray'
    },

    title: {
        paddingTop: 5,
        fontSize: 14,
        fontWeight:'bold'
    },

    description: {
        fontSize: 14,
    }
});

export const playlistViewStyle = StyleSheet.create({
    topText: {
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        paddingLeft: 20,
        paddingTop: 20,
        fontSize: 25,
    }
});