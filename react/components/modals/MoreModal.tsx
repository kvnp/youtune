import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    View,
    Text,
    Image,
    StyleSheet,
    Share,
    ActivityIndicator,
    Platform
} from "react-native";

import { TouchableRipple } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

import Navigation from "../../services/ui/Navigation";
import Downloads from "../../services/device/Downloads";
import ScrollingText from "../shared/ScrollingText";
import { appColor } from "../../styles/App";
import Music from "../../services/music/Music";

export var showModal;
var dlListener;
var lkListener;
var trListener;

export default function MoreModal({navigation}) {
    const { colors } = useTheme();
    const [ content, setContent ] = useState({
        title: null,
        subtitle: null,
        thumbnail: null,
        videoId: null,
        browseId: null,
        playlistId: null,
        type: null,
        liked: null,
        visible: false,
        downloading: false,
        downloaded: false,
        queue: 0,
        info: {progress: 0, speed: "0 Kb/s"}
    });

    const {
        title, subtitle, thumbnail,
        videoId, browseId, playlistId,
        type, liked, visible, downloading,
        downloaded, queue, info
    } = content;

    useEffect(() => {
        if (visible) {
            dlListener = Downloads.addListener(
                Downloads.EVENT_PROGRESS,
                () => {
                    if (visible) {
                        setContent({
                            ...content,
                            downloading: Downloads.isTrackDownloading(videoId),
                            downloaded: Downloads.isTrackDownloaded(videoId),
                            queue: Downloads.getDownloadingLength(),
                            info: Downloads.getDownloadInfo(videoId)
                        });
                    }
                        
                }
            );

            lkListener = Downloads.addListener(
                Downloads.EVENT_LIKE,
                like => {
                    if (visible)
                        setContent({...content, liked: like});
                }
            );

            trListener = Music.addListener(
                Music.EVENT_METADATA_UPDATE,
                track => {
                    if (track.videoId == videoId)
                        setContent({
                            ...content,
                            videoId: track.videoId,
                            playlistId: track.playlistId,
                            title: track.title,
                            subtitle: track.artist,
                            thumbnail: track.artwork,
                            visible, downloaded,
                            downloading, queue, type
                        });
                }
            )

        } else if (dlListener != null) {
            dlListener.remove();
            lkListener.remove();
            trListener.remove();
        }
    }, [visible]);

    const like = bool => {
        Downloads.likeTrack(videoId, bool);
        setContent({...content, liked: bool});
    }

    const refresh = (type, videoId) => {
        let liked = null;
        if (type == "Song")
            liked = Downloads.isTrackLikedSync(videoId);

        return liked;
    };

    showModal = e => {
        if (e.videoId != null) {
            e.type = "Song";
            e.info = Downloads.getDownloadInfo(e.videoId);
            e.downloading = Downloads.isTrackDownloading(e.videoId);
            e.downloaded = Downloads.isTrackDownloaded(e.videoId);
            e.queue = Downloads.getDownloadingLength();
        } else if (e.playlistId != null || e.browseId != null) {
            if (e.browseId != null) {
                if (e.browseId.slice(0, 2) == "UC")
                    e.type = "Artist";
                else 
                    e.type = "Playlist";
            } else
                e.type = "Playlist";
        }
        
        e.liked = refresh(e.type, e.playlistId);
        setContent({
            ...e,
            visible: true
        });
    };

    return <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setContent(content => ({...content, visible: false}))}
        onDismiss={() => setContent(content => ({...content, visible: false}))}
        hardwareAccelerated={true}>
        <Pressable onPress={() => setContent(content => ({...content, visible: false}))} style={{height: "100%", width: "100%", justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.3)"}}>
            <View style={{
                paddingHorizontal: 10,
                maxWidth: 800,
                alignSelf: "center",
                width: "100%"
            }}>
                <View style={[modalStyles.header, {backgroundColor: colors.border}, Platform.OS == "web" ? {cursor: "default"} : undefined]}>
                    <Image source={{uri: thumbnail}} style={modalStyles.thumbnail}/>
                    <View style={modalStyles.headerText}>
                        <ScrollingText>
                            <Text style={{color: colors.text}} numberOfLines={1}>{title}</Text>
                        </ScrollingText>
                        
                        <ScrollingText>
                            <Text style={{color: colors.text}} numberOfLines={1}>{subtitle}</Text>
                        </ScrollingText>
                    </View>
                        <View style={{width: 120, height: 50, alignItems: "center", alignSelf: "center", justifyContent: "center", flexDirection: "row"}}>
                        {
                        type != "Song"
                            ? undefined
                            : <>
                            <TouchableRipple
                                borderless={true}
                                rippleColor={colors.primary}
                                onPress={() => like(false)}
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginHorizontal: 5,
                                    borderRadius: 25,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <MaterialIcons
                                    name="thumb-down"
                                    color={
                                        liked == null
                                            ? "darkgray"
                                            : !liked
                                                ? colors.primary
                                                : "darkgray"
                                    }
    
                                    size={25}
                                />
                            </TouchableRipple>
                            <TouchableRipple
                                borderless={true}
                                rippleColor={colors.primary}
                                onPress={() => like(true)}
    
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginHorizontal: 5,
                                    borderRadius: 25,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <MaterialIcons
                                    name="thumb-up"
                                    color={
                                        liked == null
                                            ? "darkgray"
                                            : liked
                                                ? colors.primary
                                                : "darkgray"
                                    }
    
                                    size={25}
                                />
                            </TouchableRipple>
                            </>
                        }
                        </View>
                    
                </View>

                {
                    type == "Song"
                    ? <View style={{backgroundColor: colors.card}}>
                        <TouchableRipple
                            borderless={true}
                            rippleColor={colors.primary}
                            style={{
                                borderRadius: 5,
                                height: 50,
                                alignItems: "center",
                                flexDirection: "row"
                            }}
                            
                            onPress={() => {
                                Navigation.handleMedia({
                                    title: title,
                                    subtitle: subtitle,
                                    thumbnail: thumbnail,
                                    videoId: videoId,
                                    browseId: browseId,
                                    playlistId: playlistId,
                                }, true, navigation);
                            }}
                        >
                            <>
                                <MaterialIcons
                                    name="radio"
                                    color={colors.text}
                                    size={25}
                                    style={{marginLeft: 70}}
                                />
                                <Text style={{paddingLeft: 20, color: colors.text}}>Start radio</Text>
                            </>
                        </TouchableRipple>
                    </View>

                    : undefined
                }

                {
                    type == "Song"
                    ? <View style={{backgroundColor: colors.card}}>
                        <TouchableRipple
                            borderless={true}
                            rippleColor={colors.primary}
                            style={{
                                borderRadius: 5,
                                height: 50,
                                alignItems: "center",
                                flexDirection: "row"
                            }}
                            
                            onPress={async() => {
                                let nextIndex = Music.metadataIndex + 1;
                                let metadata = await Music.getMetadata({videoId});
                                Music.add(metadata, nextIndex);
                            }}
                        >
                            <>
                                <MaterialIcons
                                    name="queue-music"
                                    color={colors.text}
                                    size={25}
                                    style={{marginLeft: 70}}
                                />
                                <Text style={{paddingLeft: 20, color: colors.text}}>Add to queue</Text>
                            </>
                        </TouchableRipple>
                    </View>

                    : undefined
                }

                {
                    videoId
                        ? <View style={{backgroundColor: colors.card}}>
                            <TouchableRipple
                            borderless={true}
                            rippleColor={colors.primary}
                            style={{
                                borderRadius: 5,
                                height: 50,
                                alignItems: "center",
                                flexDirection: "row"
                            }}
                            onPress={
                                () => downloading
                                    ? Downloads.cancelDownload(videoId)
                                    : downloaded
                                        ? Downloads.deleteDownload(videoId)
                                        : Downloads.downloadTrack(videoId)
                            }
                        >
                            <>
                            {
                                downloading
                                    ? <ActivityIndicator
                                        color={colors.text}
                                        style={{marginLeft: 70}}
                                    />
                                    : <MaterialIcons
                                        style={{marginLeft: 70}}
                                        name={
                                            downloaded
                                                ? "delete"
                                                : "get-app"
                                        }
                                        color={colors.text}
                                        size={25}
                                    />
                            }
    
                            <Text style={{paddingLeft: 20, color: colors.text}}>
                                {
                                    downloading
                                        ? "Downloading... " + Math.floor(info.progress * 100) + "% " +  info.speed
                                        : downloaded
                                            ? "Delete" + (queue > 0
                                                ? " (" + queue + " in queue)"
                                                : "")
    
                                            : "Download" + (queue > 0
                                                ? " (" + queue + " in queue)"
                                                : "")
                                }
                            </Text>
                            </>
                        </TouchableRipple>
                        </View>


                        : undefined
                }
                <View style={{backgroundColor: colors.card}}>
                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    style={{
                        borderRadius: 5,
                        height: 50,
                        alignItems: "center",
                        flexDirection: "row"
                    }}
                    onPress={() => {}}
                >
                    {
                        type == "Song"
                            ? <>
                                <MaterialIcons name="playlist-add" style={{marginLeft: 70}} color={colors.text} size={25}/>
                                <Text style={{paddingLeft: 20, color: colors.text}}>Add to playlist</Text>
                            </>

                            : <>
                                <MaterialIcons name="library-add" style={{marginLeft: 70}} color={colors.text} size={25}/>
                                <Text style={{paddingLeft: 20, color: colors.text}}>Add to library</Text>
                            </>
                    }
                </TouchableRipple>
                </View>
                
                <View style={{backgroundColor: colors.card}}>
                <TouchableRipple
                    borderless={true}
                    rippleColor={colors.primary}
                    style={{
                        borderRadius: 5,
                        height: 50,
                        alignItems: "center",
                        flexDirection: "row"
                    }}
                    onPress={() => {
                        let file;
                        let message;
                        if (type == "Song") {
                            message = subtitle + " - " + title;
                            file = "watch?v=" + videoId;
                        } else if (type == "Playlist") {
                            message = title;
                            file = "playlist?list=" + playlistId;
                        } else {
                            message = title;
                            file = "channel/" + browseId;
                        }

                        try {
                            Share.share({
                                title: message,
                                url: window.location.origin + "/" + file,
                                message: message + ":\n" + window.location.origin + "/" + file
                            }, {
                                dialogTitle: title
                            }).then(event => {
                                console.log(event);
                                setContent({...content, visible: false});
                            });

                        } catch (error) {
                            alert(error.message);
                        }
                    }}
                >
                    <>
                    <MaterialIcons name="share" style={{marginLeft: 70}} color={colors.text} size={25}/>
                    <Text style={{paddingLeft: 20, color: colors.text}}>Share</Text>
                    </>
                </TouchableRipple>
                </View>
            </View>
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
        textAlign: "left",
        paddingVertical: 5,
        paddingHorizontal: 50,
        height: 30,
        maxWidth: 800,
        alignSelf: "center",
        width: "100%"
    },
});