
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

    /**
     * API initialization status:
     * 0: not initialized, 
     * 1: initializing,
     * 2: initialized
     */
    static init = 0;

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
    static initialize(): Promise<API> {
        console.log("Current initialization state: " + this.init);
        return new Promise((resolve, reject) => {
            if (this.init == 1)
                API.addListener(
                    API.EVENT_API_INITIALIZED,
                    () => resolve(this)
                );
            else if (this.init == 2)
                resolve(this);
            else {
                this.init = 1;
                const baseURL = Platform.OS == "web"
                    ? window.location.origin + "/proxy"
                    : "https://music.youtube.com";

                API.YTMusic.initialize({ baseURL, headers: {} })
                    .then(_ytm => {
                        UI.setHeader({ url: API.YTMusic.initialData[1].data.background.musicThumbnailRenderer.thumbnail.thumbnails[0].url });
                        API.init = 2;
                        this.#emitter.emit(API.EVENT_API_INITIALIZED, undefined);
                        resolve(this);
                    })
                    .catch(rej => {
                        console.error("API initialization failed: " + reject);
                        API.init = 0;
                        reject(rej);
                    });
            }
        });
    }

    /**
     * Wait for the API to initialize. If it's already initialized, it will return immediately.
     * If it's not initialized, it will call initialize() and return when it's done.
     * If it's initializing, it will wait for it to finish.
     * @returns Promise<API>
     */
    static waitForInitialization(): Promise<API> {
        if (this.init == 0) {
            return API.initialize();
        } else {
            return new Promise((resolve, reject) => {
                if (this.init == 1)
                    API.addListener(API.EVENT_API_INITIALIZED, () => {
                        resolve(this);
                    });
                else if (this.init == 2)
                    resolve(this);
            });
        }
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
        const results = await API.YTMusic.getNext(videoId, listId!);
        return results.map(next => Track.fromNextResult(next));
    }

    /**
     * Get a song from a videoId
     * 
     * @param videoId videoId of a song
     * @returns Promise<Track>
     */
    static async getSong(videoId: string): Promise<Track> {
        console.log("Getting", videoId);
        const result: SongFull = await API.YTMusic.getSong(videoId);
        return Track.fromSongFullResult(result);
    }
}