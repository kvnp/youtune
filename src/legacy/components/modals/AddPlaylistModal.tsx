import { useState } from "react";
import {
    Modal,
    Pressable,
    View,
    StyleSheet,
    Platform,
    Text
} from "react-native";

import { Button, TextInput } from "react-native-paper";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

import { appColor } from "../../styles/App";

export default function AddPlaylistModal({visible, addCallback, cancelCallback}) {
    const {colors} = useTheme();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => cancelCallback()}
        onDismiss={() => cancelCallback()}
        hardwareAccelerated={true}
    >
        <Pressable onPress={() => cancelCallback()} style={{height: "100%", width: "100%", justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.3)"}}>
            <Pressable style={{
                paddingHorizontal: 10,
                maxWidth: 800,
                alignSelf: "center",
                width: "100%"
            }}>
                <View style={[modalStyles.header, {backgroundColor: colors.border}, Platform.OS == "web" ? {cursor: "default"} : undefined]}>
                    <View style={modalStyles.headerText}>
                        <Text style={{color: colors.text}} numberOfLines={1}>Add playlist</Text>
                        <Text style={{color: colors.text}} numberOfLines={1}></Text>
                    </View>
                </View>

                <View style={{height: 80, alignItems: "center", paddingHorizontal: 50, flexDirection: "row", backgroundColor: colors.card, cursor: Platform.OS == "web" ? "default" : undefined}}>
                    <MaterialIcons name="title" color={colors.text} size={25}/>
                    <TextInput
                        placeholderTextColor={colors.text}
                        underlineColor={colors.border}
                        style={[styles.inputText, {color: colors.text, backgroundColor: colors.card, marginLeft: 20, flex: 1}]}
                        value={title}
                        onChangeText={text => setTitle(text)}
                        placeholder="Title"
                        mode="flat"
                    />
                </View>

                <View style={{height: 80, alignItems: "center", paddingHorizontal: 50, flexDirection: "row", backgroundColor: colors.card, cursor: Platform.OS == "web" ? "default" : undefined}}>
                    <MaterialIcons name="description" color={colors.text} size={25}/>
                    <TextInput
                        placeholderTextColor={colors.text}
                        underlineColor={colors.border}
                        style={[styles.inputText, {color: colors.text, backgroundColor: colors.card, marginLeft: 20, flex: 1}]}
                        value={description}
                        onChangeText={text => setDescription(text)}
                        placeholder="Description"
                    />
                </View>

                <View style={{height: 80, width: "100%", backgroundColor: colors.card, flexDirection: "row", justifyContent: "center", cursor: Platform.OS == "web" ? "default" : undefined}}>
                    <Button mode="text" style={{marginHorizontal: 20, alignSelf: "center"}} onPress={() => cancelCallback()}>
                        <Text>CANCEL</Text>
                    </Button>

                    <Button mode="contained" style={{ marginHorizontal: 20, alignSelf: "center"}} onPress={() => addCallback(title, description)}>
                        <Text>CREATE</Text>
                    </Button>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
};

const modalStyles = StyleSheet.create({
    header: {
        flexDirection: "row",
        height: 70,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },

    headerText: {
        flex: 1,
        paddingLeft: 10,
        overflow: "hidden",
        width: 140,
    },

    thumbnail: {
        backgroundColor: appColor.background.backgroundColor,
        height: 50,
        width: 50
    },

    entry: {
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 50,
        height: 50,
    },

    entryView: {
        height: 50,
    }
});

const styles = StyleSheet.create({
    paddingView: {
        flexGrow: 1,
    },

    topText: {
        padding: 50,
        fontSize: 35,
        fontWeight: 'bold',
    },

    headerContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    },

    headerCenterContainer: {
        alignSelf: 'center',
    },

    inputText: {
        textAlign: 'justify',
        width: "100%",
        fontSize: 15
    },

    headerTopRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
        width: 200,
        paddingRight: 5,
        paddingLeft: 5
    },

    albumCover: {
        backgroundColor: 'darkgray',
        height: 70,
        width: 70,
        marginRight: 30,
    },

    closeButton: {
        backgroundColor: 'white',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 25,

        alignSelf: 'center',
    },

    headerButtonView: {
        paddingTop: 10,
        flexDirection: 'row',
        alignSelf: 'center'
    },

    headerButton : {
        marginRight: 5,
        marginLeft: 5,
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: 5
    },

    headerButtonText: {
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 20
    },

    closeButtonText: {
        fontSize: 15,
    }
});

/*
"Man hilft immer zwei", Elias Koné - 14. Juni 2020
*/