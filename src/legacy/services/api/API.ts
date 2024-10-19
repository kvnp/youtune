
import { DeviceEventEmitter, EmitterSubscription, Platform } from "react-native";
import YTMusic, { SongFull } from "ytmusic-api";
import UI from "../ui/UI";
import Track from "../../model/music/track";

/**
 * @class
 * @example
 * import API from "./services/api/API";
 * 
 * API.initialize().then(() => {
 *   console.log("API initialized");
 * });
 * 
 * API.YTMusic.search("Never Gonna Give You Up").then(console.log);
 */
export default class API {
    /**
     * Event emitter for API events
     * @private
     * @static
     * @memberof API
     * @type {DeviceEventEmitter}
     * @example
     * API.#emitter.addListener(API.EVENT_API_INITIALIZED, () => {
     *   console.log("API initialized");
     * });
     */
    static #emitter = DeviceEventEmitter;

    /**
     * Event API_INITIALIZED
     * @static
     * @memberof API
     * @type {string}
     */
    static EVENT_API_INITIALIZED: string = "event-api-initialized";

    /**
     * Add an event listener
     * @static
     * @memberof API
     * @param {string} event
     * @param {() => void} callback
     * @returns {EmitterSubscription}
     * @example
     * API.addListener(API.EVENT_API_INITIALIZED, () => {
     *   console.log("API initialized");
     * });
     */
    static addListener(event: string, callback: () => void): EmitterSubscription {
        return this.#emitter.addListener(event, callback);
    }

    /**
     * YTMusic API instance
     * @static
     * @memberof API
     * @type {YTMusic}
     * @example
     * API.YTMusic.search("Never Gonna Give You Up").then(console.log);
     */
    static YTMusic: YTMusic = new YTMusic();

    static init = 0;
    /**
     * API initialization status:
     * 0: not initialized, 
     * 1: initializing,
     * 2: initialized
     */
    static set initialized(value: number) {
        if (value == 2)
            this.#emitter.emit(API.EVENT_API_INITIALIZED);

        this.init = value;
    }
    /**
     * API initialization status:
     * 0: not initialized, 
     * 1: initializing,
     * 2: initialized
     */
    static get initialized() {
        return this.init;
    }

    /**
     * Initialize the API. If it's already initialized, it will return immediately.
     * If it's initializing, it will wait for it to finish.
     * @returns Promise<boolean>
     * @static
     * @memberof API
     * @example
     * API.initialize().then(() => {
     *    console.log("API initialized");
     * });
     * 
     */
    static initialize() {
        return new Promise((resolve, reject) => {
            if (this.initialized == 0)
                this.initialized = 1;
            else if (this.initialized == 1)
                return new Promise((resolve, reject) => {
                    API.addListener(API.EVENT_API_INITIALIZED, () => {
                        resolve(true);
                    })
                });
            else
                return resolve(true);

            const baseURL = Platform.OS == "web"
                ? window.location.origin + "/proxy"
                : "https://music.youtube.com";

            API.YTMusic.initialize({ baseURL, headers: {} })
                .then(_ytm => {
                    UI.setHeader({ url: API.YTMusic.initialData[1].data.background.musicThumbnailRenderer.thumbnail.thumbnails[0].url });
                    API.initialized = 2;
                    resolve(true);
                })
                .catch(reject => {
                    console.error("API initialization failed: " + reject);
                    API.initialized = 0;
                });
        });
    }

    /**
     * Wait for the API to initialize. If it's already initialized, it will return immediately.
     * If it's not initialized, it will call initialize() and return when it's done.
     * If it's initializing, it will wait for it to finish.
     * @returns Promise<API>
     */
    static waitForInitialization(): Promise<API> {
        return new Promise((resolve, reject) => {
            console.log("Waiting for initialization");
            console.log("Initialized: " + this.initialized);
            if (this.initialized == 0)
                API.initialize().then(() => {
                    resolve(this);
                });
            if (this.initialized == 1)
                API.addListener(API.EVENT_API_INITIALIZED, () => {
                    resolve(this);
                });
            else
                resolve(this);
        });
    }

    /**
     * Get the next songs of a song radio based on a videoId and a listId
     * (song radio, album, playlist)
     * 
     * @param videoId videoId of a song to get a song radio from
     * @param listId playlistId that corresponds to an album or a playlist or a song radio
     * @returns Promise<Track[]>
     */
    static async getNextSongs(videoId: string, listId?: string): Promise<Track[]> {
        let tracks: Track[] = [];
        const results = await API.YTMusic.getNext(videoId, listId!);
        for (const result of results)
            tracks.push(Track.fromNextResult(result));

        return tracks;
    }

    /**
     * Get a song from a videoId
     * 
     * @param videoId videoId of a song
     * @returns Promise<Track>
     */
    static async getSong(videoId: string): Promise<Track> {
        const result: SongFull = await API.YTMusic.getSong(videoId);
        return Track.fromSongFullResult(result);
    }
}