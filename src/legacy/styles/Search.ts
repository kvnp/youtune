import { StyleSheet } from 'react-native';

export const searchBarStyle = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },

    inputBox: {
        flexDirection: "row",
        justifyContent: "center",
        maxWidth: 800,
        width: "100%"
    },

    input: {
        height: 45,
        flex: 1,
        alignSelf: "center",
        backgroundColor: "rgba(25, 25, 25, 0.3)",
        textAlign: "center",
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        elevation: 1
    },

    button: {
        width: 60,
        height: 45,
        backgroundColor: "rgba(25, 25, 25, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 1
    },

    suggestion: {
        height: 50,
        width: "100%",
        justifyContent: "center",
        flexDirection: "row"
    },

    suggestionContainer: {
        flex: 1,
        backgroundColor: "rgba(25, 25, 25, 0.5)",
        borderRadius: 25,
        margin: 5,
        borderWidth: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
        elevation: 1
    }
});

export const topicStyle = StyleSheet.create({
    topicView: {
        paddingTop: 20,
        width: '100%'
    },

    topicHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        paddingLeft: 50
    },
});

export const resultStyle = StyleSheet.create({
    scrollMargin: {
        marginBottom: 93
    },

    resultHeader: {
        marginTop: 10,
        fontSize: 30,
        fontWeight: 'bold'
    },

    resultView: {
        justifyContent: "center",
        flexGrow: 1,
        borderRadius: 5,
        height: 70,
        flexDirection: 'row',
        alignSelf: "stretch",
        alignItems: 'center'
    },

    resultCover: {
        width: 70,
        height: 70,
        backgroundColor: "gray"
    },

    resultColumnOne: {
        paddingLeft: 10,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: "center"
    },

    resultColumnTwo: {
        paddingLeft: 10,
        width: 120,
        flexDirection: 'column',
        alignItems: 'center'
    },

    resultText: {
        fontSize: 15
    }
});

export const searchStyle = StyleSheet.create({
    preResults: {
        fontSize: 70,
        alignSelf: 'center'
    },

    emptyView: {
        marginBottom: -20
    }
});

export const specificStyle = StyleSheet.create({
    container: {
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        width: '80%',
        marginHorizontal: "auto",
        alignSelf: "center"
    },

    button: {
        backgroundColor: 'transparent',
        flexGrow: 1,
        height: 30,
        borderRadius: 75,
        marginLeft: 2,
        marginRight: 2,
        justifyContent: 'center',
        borderColor: 'black',
        borderWidth: 1.5
    },

    text: {
        alignSelf: 'center',
    },
});