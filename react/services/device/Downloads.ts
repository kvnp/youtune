import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import Playlist from "../../model/music/playlist";
import IO from "./IO";
import Storage from "./storage/Storage";
import Track from "../../model/music/track";
import API from "../api/API";

export default class Downloads {
    static #downloadedTracks: Array<string> = [];
    static #cachedTracks: Array<string> = [];
    static #likedTracks: Array<string> = [];
    static #downloadQueue = Object.create(null);
    static initialized = false;

    static #emitter = DeviceEventEmitter;
    static EVENT_INITIALIZE = "event-initialize";
    static EVENT_PROGRESS = "event-progress";
    static EVENT_DOWNLOAD = "event-download";
    static EVENT_LIKE = "event-like";

    static addListener(event: string, listener: (data: any) => void): EmitterSubscription {
        return this.#emitter.addListener(event, listener);
    }

    static initialize() {
        return new Promise(async(resolve, reject) => {
            if (this.initialized)
                return resolve(true);
            
            this.#cachedTracks = await Storage.getAllKeys("Tracks");
            this.#likedTracks = await Storage.getAllKeys("Likes");
            this.#downloadedTracks = await Storage.getAllKeys("Downloads");

            this.initialized = true;
            this.#emitter.emit(this.EVENT_INITIALIZE, true);
            resolve(true);
        });
    }

    static waitForInitialization() {
        return new Promise((resolve, reject) => {
            if (this.initialized)
                return resolve(null);

            let eventListener = this.addListener(
                this.EVENT_INITIALIZE,
                () => {
                    resolve(null);
                    eventListener.remove();
                }
            );
        });
    }

    static deleteDownload(videoId: string) {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            try {
                await Storage.deleteItem("Downloads", videoId);
                let index = this.#downloadedTracks.indexOf(videoId);
                if (index != -1)
                    this.#downloadedTracks.splice(index, 1);

                if (this.isTrackLikedSync(videoId) != true) {
                    await Storage.deleteItem("Tracks", videoId);
                    index = this.#cachedTracks.indexOf(videoId);
                    if (index != -1)
                        this.#cachedTracks.splice(index, 1);
                }
                
                this.#emitter.emit(this.EVENT_PROGRESS, true);
                resolve(null);
            } catch (e) {
                console.log(e);
            }
        });
    }

    static downloadTrack(videoId: string, cacheOnly: boolean) {
        // if (videoId in this.#downloadQueue)
        //     return;

        // let worker = new Worker("/public/download/worker.js");
        // this.#downloadQueue[videoId] = {worker, speed: "0Kb/s", progress: 0};
        // this.#emitter.emit(this.EVENT_PROGRESS, videoId);
        // worker.onmessage = e => {
        //     if (e.data.message == "track")
        //         Storage.setItem("Tracks", e.data.payload);
        //     else if (e.data.message == "download")
        //         Storage.setItem("Downloads", e.data.payload);
        //     else {
        //         this.#downloadQueue[videoId].speed = e.data.payload.speed;
        //         this.#downloadQueue[videoId].progress = e.data.payload.progress;
        //         if (e.data.payload.completed) {
        //             delete this.#downloadQueue[videoId];
        //             this.#downloadedTracks.push(videoId);
        //             this.#emitter.emit(this.EVENT_DOWNLOAD, true);
        //         }
        //         this.#emitter.emit(this.EVENT_PROGRESS, videoId);
        //     }
        // };
        // worker.postMessage({videoId, cacheOnly});
        console.log("to be implemented");
    }

    static cancelDownload(videoId: string) {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            if (videoId in this.#downloadQueue) {
                // let worker = this.#downloadQueue[videoId].worker;
                // worker.terminate();
                delete this.#downloadQueue[videoId];
                this.#emitter.emit(this.EVENT_PROGRESS, true);
            }
            resolve(null);
        });
    }

    static likeTrack(videoId: string, like: boolean | null) {
        return new Promise(async(resolve, reject) => {
            let prevState = await Storage.getItem("Likes", videoId);
            console.log({previousState: prevState});
            let deleting = false;
            if (prevState != null)
                deleting = prevState.like == like;

            console.log({deleting: deleting});

            if (deleting) {
                console.log({m: "deleting", videoId});
                await Storage.deleteItem("Likes", videoId);
            } else {
                let index = this.#likedTracks.indexOf(videoId);
                if (like) {
                    console.log({m: "liking", videoId});
                    await Downloads.downloadTrack(videoId, true);
                    if (index == -1)
                        this.#likedTracks.push(videoId);
                } else {
                    console.log({m: "disliking", videoId});

                    if (index == -1)
                        this.#likedTracks.splice(index, 1);
                }

                await Storage.setItem("Likes", {
                    videoId: videoId,
                    like: like
                });
            }

            if (deleting || !like) {
                if (!this.isTrackDownloaded(videoId) && this.isTrackCached(videoId))
                    await Storage.deleteItem("Tracks", videoId);
            }

            let index = this.#likedTracks.indexOf(videoId);
            if (!deleting && like && !this.isTrackCached(videoId)) {
                
            } else if ((!like || deleting) && index > -1) {
                
            }

            this.#emitter.emit(this.EVENT_LIKE, deleting ? null : like);
            return resolve(videoId);
        });
    }

    static isTrackDownloaded(videoId: string): boolean | null {
        if (!this.initialized || !videoId)
            return null;
        
        return this.#downloadedTracks.includes(videoId);
    }

    static isTrackCached(videoId: string): boolean | null {
        if (!this.initialized || !videoId)
            return null;

        return this.#cachedTracks.includes(videoId);
    }

    static isTrackLikedSync(videoId: string): boolean | null {
        if (!videoId)
            return null;
        
        if (this.#likedTracks.includes(videoId))
            return true;
        else
            return false;
    }

    static isTrackLiked(videoId: string): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            let sync = Downloads.isTrackLikedSync(videoId);
            if (sync)
                resolve(sync);
            
            let object = await Storage.getItem("Likes", videoId);
            resolve(object?.like);
        });
    }

    static isTrackDownloading(videoId: string): boolean | null {
        if (!this.initialized || !videoId)
            return null;

        return videoId in this.#downloadQueue;
    }

    static getDownloadingLength(): number {
        if (!this.initialized)
            return 0;
        
        return Object.keys(this.#downloadQueue).length;
    }

    static getDownloadsLength(): number {
        if (!this.initialized)
            return 0;
        
        return this.#downloadedTracks.length;
    }

    static getDownloadInfo(videoId: string): {progress: number, speed: string} {
        if (videoId in this.#downloadQueue)
            return {
                progress: this.#downloadQueue[videoId].progress,
                speed: this.#downloadQueue[videoId].speed
            }
        else
            return {progress: 0, speed: "0 Kb/s"}
    }

    static getTrack(videoId: string): Promise<Track | null> {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            if (!this.#cachedTracks.includes(videoId))
                return resolve(null);
            
            let track: Track = await Storage.getItem("Tracks", videoId);
            track.artwork = IO.getBlobAsURL(track.artwork);
            resolve(track);
        });
    }

    static getStream(videoId: string): Promise<{url: string, mimeType: string, audioQuality: number} | null> {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            if (!this.#downloadedTracks.includes(videoId))
                return resolve(null);

            let object = await Storage.getItem("Downloads", videoId);
            resolve({
                ...object,
                url: IO.getBlobAsURL(object.url)
            });
        });
    }

    static getDownload(videoId: string): Promise<string | null> {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            if (!this.#downloadedTracks.includes(videoId))
                return resolve(null);
            
            let url = await Storage.getItem("Downloads", videoId);
            resolve(url);
        });
    }

    static getPlaylist(playlistId: string, videoId: string): Promise<Playlist | null>  {
        return new Promise(async(resolve, reject) => {
            if (!this.initialized)
                await Downloads.waitForInitialization();

            let localPlaylist = new Playlist();
            localPlaylist.playlistId = playlistId;
            localPlaylist.subtitle = "Playlist • Local";
            let idList;
            
            if (playlistId == "LOCAL_DOWNLOADS") {
                idList = this.#downloadedTracks;
                localPlaylist.title = "Downloads";
            } else if (playlistId == "LOCAL_LIKES") {
                idList = this.#likedTracks;
                localPlaylist.title = "Liked Songs";
            }
            
            if (idList)
                for (let i = 0; i < idList.length; i++) {
                    let currentVideoId = idList[i];
                    let track = await this.getTrack(currentVideoId);
                    
                    if (track) {
                        track.playlistId = playlistId;

                        if (currentVideoId == videoId)
                            localPlaylist.index = i;
                    } else {
                        let audioInfo = await API.getAudioInfo({videoId: currentVideoId});
                        track = new Track(
                            audioInfo.videoId,
                            audioInfo.channelId,
                            null,
                            audioInfo.title,
                            audioInfo.artist,
                            audioInfo.artwork,
                            audioInfo.duration
                        );
                        let trackContent = await API.getAudioStream({videoId: currentVideoId})
                        track.url = trackContent.url;
                        track.contentType = trackContent.mimeType;
                    }
                    
                    localPlaylist.list.push(track);
                }

            localPlaylist.secondSubtitle = localPlaylist.list.length + (localPlaylist.list.length != 1 ? " titles" : " title");
            resolve(localPlaylist);
        });
    }
}