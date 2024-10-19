import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import { State } from "react-native-track-player";
import Playlist from "../../model/music/playlist";
import Track from "../../model/music/track";
import API from "../api/API";
import Music from "./Music";

/// <reference types="chrome"/>
/// <reference types="cast"/>

export default class Cast {
    static player: cast.framework.RemotePlayer;
    static controller: cast.framework.RemotePlayerController;
    static initialized = false;
    static sessionId = null;

    static #emitter = DeviceEventEmitter;
    static EVENT_SESSION = "event-cast-session";
    static EVENT_CAST = "event-cast-status";
    static EVENT_POSITION = "event-cast-position";
    static EVENT_METADATA = "event-cast-metadata";
    static EVENT_PLAYERSTATE = "event-cast-playerstate";
    static EVENT_VOLUME = "event-cast-volume";

    static addListener(event: string, listener: (data: any) => void): EmitterSubscription {
        try {
            return this.#emitter.addListener(event, listener);
        } finally {
            if (event == this.EVENT_CAST) {
                let castState = "NOT_CONNECTED";
                
                if (window?.cast) {
                    castState = !window.chrome.cast
                        ? "NOT_CONNECTED"
                        : cast.framework.CastContext.getInstance().getCastState()
                }
                
                this.#emitter.emit(
                    this.EVENT_CAST,
                    {castState: castState}
                );
            }
        }
    }

    static async #getSession(requestSession: boolean) {
        let sessionIsNew = false;
        let session = cast.framework.CastContext.getInstance().getCurrentSession();
        if (!session && requestSession) {
            await cast.framework.CastContext.getInstance().requestSession();
            sessionIsNew = true;
            session = cast.framework.CastContext.getInstance().getCurrentSession();
            if (session) session.addEventListener(
                cast.framework.SessionEventType.VOLUME_CHANGED,
                (e: cast.framework.VolumeEventData) => this.#emitter.emit(this.EVENT_VOLUME, e.volume)
            );      
        }

        return {
            session: session,
            sessionIsNew: sessionIsNew
        }
    }

    static initialize() {
        if (!window?.chrome)
            return;

        window['__onGCastApiAvailable'] = isAvailable => {
            if (isAvailable) {
                Cast.player = new cast.framework.RemotePlayer();
                Cast.controller = new cast.framework.RemotePlayerController(Cast.player);

                let instance = cast.framework.CastContext.getInstance();
                instance.setOptions({
                    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                    resumeSavedSession: true
                });

                instance.addEventListener(
                    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
                    e => {
                        this.#emitter.emit(this.EVENT_CAST, e);
                        if (e.castState)
                            this.restoreMediaInfo();
                    }
                );

                Cast.controller.addEventListener(
                    cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
                    e => this.#emitter.emit(this.EVENT_POSITION, e.value)
                );

                Cast.controller.addEventListener(
                    cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
                    e => {
                        if (Music.metadata.videoId != e.value?.metadata.songName && e.value)
                            this.restoreMediaInfo();
                    }
                );

                Cast.controller.addEventListener(
                    cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
                    e => {
                        let state;
                        switch (e.value) {
                            case "IDLE":
                                state = State.Ready;
                                break;
                            case "PLAYING":
                                state = State.Playing;
                                break;
                            case "PAUSED":
                                state = State.Paused;
                                break;
                            case "BUFFERING":
                                state = State.Buffering;
                        }
                        this.#emitter.emit(this.EVENT_PLAYERSTATE, state);
                    }
                );

                Cast.initialized = true;
            }
        };

        if (window.chrome && !window.chrome.cast) {
            var script = document.createElement('script');
            script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
            document.head.appendChild(script);
        }
    }

    static getMediaInfo() {
        let session = cast.framework.CastContext.getInstance().getCurrentSession();
        if (!session)
            return null;
        
        let media = session.getMediaSession();
        if (!media)
            return;

        let metadata = media.media.metadata;
        let playlist = new Playlist();
        playlist.index = 0;
        playlist.list.push(new Track(
            metadata.songName, null, "CAST", metadata.title,
            metadata.artist, metadata.images[0].url,
            media.media.duration
        ));

        return {playlist: playlist, position: media.getEstimatedTime()};
    }

    static restoreMediaInfo() {
        let mediaInfo = this.getMediaInfo();
        if (mediaInfo)
            Music.startPlaylist(mediaInfo.playlist, mediaInfo.position);
    }

    static async cast() {
        /*let startsWithBlob = url => url != undefined
            ? url.startsWith("blob")
            : true;

        let startIndex = Music.metadataIndex;
        let firstMedia;
        for (let i = 0; i < Music.metadataList.length; i++) {
            let currentMetadata = Music.metadataList[i];
            let src;

            if (Music.trackUrlLoaded[i] && !startsWithBlob(currentMetadata.url)) {
                src = currentMetadata.url;
            } else {
                try {
                    Music.metadataList[i].url = await API.getAudioStream({
                        videoId: currentMetadata.videoId 
                    });

                    src = Music.metadataList[i].url;
                } catch (_) {
                    src = currentMetadata.url;
                }
            }

            let mediaInfo = new chrome.cast.media.MediaInfo(src, "audio/mp4");
            mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
            mediaInfo.metadata.title = currentMetadata.title;
            mediaInfo.metadata.artist = currentMetadata.artist;
            if (Music.metadataIndex == i) {
                firstMedia = mediaInfo;
            }

            if (!startsWithBlob(currentMetadata.artwork)) {
                mediaInfo.metadata.images = [new chrome.cast.Image(currentMetadata.artwork)];
            }
            
            request.queueData.items.push(new chrome.cast.media.QueueItem(mediaInfo));
        }*/

        let media = Music.metadata;
        let info = Cast.getMediaInfo();
        if (info) {
            let currentId = info.playlist.list[info.playlist.index].videoId ;
            if (currentId == media.videoId )
                return;
        }

        let currentTime = 0;
        let {session, sessionIsNew} = await Cast.#getSession(true);
        if (sessionIsNew)
            currentTime = Music.position;

        if (media.artwork?.startsWith("blob") || !media.artwork)
            media.artwork = (await API.getAudioInfo({videoId: media.videoId })).artwork;

        if (media.url?.startsWith("blob") || !media.url)
            media.url = (await API.getAudioStream({videoId: media.videoId })).url;

        let mediaInfo = new chrome.cast.media.MediaInfo(media.url, "audio/mp4");
        mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
        mediaInfo.metadata.images = [new chrome.cast.Image(media.artwork)];
        mediaInfo.metadata.songName = media.videoId ;
        mediaInfo.metadata.title = media.title;
        mediaInfo.metadata.artist = media.artist;
        let request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.currentTime = currentTime;
        /*request.queueData = new chrome.cast.media.QueueData();
        request.queueData.repeatMode = chrome.cast.media.RepeatMode.SINGLE;*/
        
        if (session) {
            session.loadMedia(request);
        }
    }

    static async seekTo(position: number) {
        let {session} = await Cast.#getSession(false);
        if (session)
            session.sendMessage("urn:x-cast:com.google.cast.media", {
                mediaSessionId: session.getMediaSession()?.mediaSessionId,
                requestId: 1,
                type: "SEEK",
                currentTime: position
            });
    }

    static get volume() {
        return this.player?.volumeLevel;
    }

    static set volume(value) {
        if (!this.player)
            return;

        this.player.volumeLevel = value;
        this.controller.setVolumeLevel();
    }

    static get deviceInfo() {
        let session = cast.framework.CastContext.getInstance().getCurrentSession();
        return {
            displayName: this.player?.displayName,
            receiverType: session?.getCastDevice().receiverType,
            capabilities: session?.getCastDevice().capabilities,
            friendlyName: session?.getCastDevice().friendlyName
        };
    }

    static play() {
        Cast.controller.playOrPause();
    }

    static pause() {
        Cast.controller.playOrPause();
    }

    static reset() {
        this.disconnect();
    }

    static disconnect() {
        let instance = cast.framework.CastContext.getInstance();
        let session = instance.getCurrentSession();
        if (!session)
            instance.endCurrentSession(true);
        else
            session.endSession(true);
    }
}