import React, {Component} from 'react';

import {
    ImageBackground,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    View
} from "react-native";

import LinearGradient from 'react-native-linear-gradient';

import { fetchBrowse } from '../modules/Tube';

/*const HeaderDb = {
    "https://lh3.googleusercontent.com/3OazqYM5TA4lMDZ0A-52-v6Zg4L-uFsAmfMp8aC-l-TUgr_UwPvayfxy_5hs5ll4B4zpj2hrG9A=w2880-h1613-l90-rj": true,
    "https://lh3.googleusercontent.com/G2nNxQ2O_svAtYlismpu0ZfNvusgKGBVpq-LI4xsHPeJELQO2_wOOu9NvOHcb9X1VvPR5_qx=w2880-h1620-l90-rj":    true,
    "https://lh3.googleusercontent.com/zG2J10I50KGW5v6bk9nPzkHEUI-JRU8Ok_h4rZD1AbrT0dM2zGFUUR-IFzL7oXISeY1ZEJAbrL4=w2880-h1613-l90-rj": true,
    "https://lh3.googleusercontent.com/KSM3z3kDJmVatKI47EHy7rkP9wZY6kkM1pAe1YGW7dajrs0ioZd9j_BCF2Q0ql25RottK03Z0Q=w2880-h1613-l90-rj":  true,
    "https://lh3.googleusercontent.com/oTR9fV0U5-sWG4ftLG7mBDtZHyxVgXlhPy7v8zDhRgUQnrCTPC_Eq3uodcYOo9bViF8A8CMy5w=w2880-h1613-l90-rj":  true,
};*/

export class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            barStyle: "dark-content",
            headerColor: "black",
            source: require("../assets/img/header.jpg")
        }
    }

    componentDidUpdate(previousProps, previousState) {
        if (this.props.source != undefined) {
            if (this.props.source != previousProps.source) {
                this.setImage(this.props.source);
                //this.setHeader(this.props.source);
            }
        }
    }

    setImage = (url) => {
        if (url == null) {
            this.setState({source: require("../assets/img/header.jpg")});
        } else {
            /*if (HeaderDb.hasOwnProperty(url))
                this.setState({source: {uri: url}});
            else {***}*/

            if (typeof url == "string")
                this.setState({source: {uri: url}});
            else if (typeof url == "number")
                this.setState({source: url});
        }
    }

    /*setHeader = (url) => {
        if (url == null)
            StatusBar.setBarStyle(this.state.barStyle, true);

        else {
            if (HeaderDb.hasOwnProperty(url)) {
                let barStyle = HeaderDb[url] ? "dark-content" : "light-content";
                let headerColor = HeaderDb[url] ? "gray" : "white";
                StatusBar.setBarStyle(barStyle, true);

                this.setState({
                    barStyle: barStyle,
                    headerColor: headerColor
                });
            } else {
                this.setState({
                    barStyle: "light-content",
                    headerColor: "white"
                });

                StatusBar.setBarStyle("light-content", true);
            }
        }
    }*/

    render() {
        return (
            <ImageBackground imageStyle={styles.imageStyle}
                             style={[styles.containerStyle, this.props.style]}
                             source={this.state.source}>
                <LinearGradient style={[styles.linearGradient, styles.imageStyle]}
                                colors={["#7f9f9f9f", "#ffffff00"]}>
                                    
                    <Text style={[{color: this.state.headerColor}, styles.textStyle]}>
                        {this.props.text}
                    </Text>
                </LinearGradient>
            </ImageBackground>
        )
    }
}


export class Playlist extends Component {
    constructor(props) {
        super(props);
        this.playlist = this.props.playlist;
        this.browse = null;
    }

    viewPlaylist = () => {
        if (this.browse == null) fetchBrowse(this.playlist.playlistId).then((result) => {
            this.browse = result;
            this.props.navigation.navigate("Playlist", result);
        });

        else this.props.navigation.navigate("Playlist", this.state.browse);
    }

    render() {
        return (
            <View style={[this.props.style, styles.playlistContainer]}>
                <TouchableOpacity onPress={() => this.viewPlaylist()}>
                    <Image style={styles.playlistCover} source={{uri: this.playlist.thumbnail}}/>
                </TouchableOpacity>

                <Text style={styles.playlistTitle}
                      numberOfLines={2}>
                    {this.playlist.title}
                </Text>

                <Text style={styles.playlistDesc}
                      numberOfLines={2}>
                    {this.playlist.subtitle}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    imageStyle: {
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        backgroundColor: 'transparent'
    },

    linearGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },

    containerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginBottom: -20,
        zIndex: 1
    },

    textStyle: {
        fontSize: 45,
        fontWeight: 'bold'
    },

    playlistContainer: {
        height: 230,
        width: 150,
    },

    playlistCover: {
        alignItems:'center',
        justifyContent:'center',
        height: 150,
        width: 150,
        backgroundColor: 'gray'
    },

    playlistTitle: {
        paddingTop: 5,
        fontSize: 14,
        fontWeight:'bold'
    },

    playlistDesc: {
        fontSize: 14,
    },
});