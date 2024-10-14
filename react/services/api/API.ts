import Extractor from "./Extractor";
import Device from "../device/Device";
import Settings from "../device/Settings";
import HTTP from "./HTTP";
import IO from "../device/IO";
import UI from "../ui/UI";
import Track from "../../model/music/track";

export default class API {
    static RequestBody = class RequestBody {
        static BODY = () => {
            return {
                context: {
                    client: {
                        clientName: "ANDROID_MUSIC",
                        clientVersion: "5.16.51",
                        ...(Settings.Values.transmitLanguage
                            ? {gl: Device.Language.GL, hl: Device.Language.HL}
                            : undefined
                        )
                    }
                }
            }
        };

        static WEB = () => {
            return {
                context: {
                    client: {
                        clientName: "WEB_REMIX",
                        clientVersion: "1.20241007.00.00",
                        ...(Settings.Values.transmitLanguage
                            ? {gl: Device.Language.GL, hl: Device.Language.HL}
                            : undefined
                        )
                    }
                }
            }
        };
    }
    
    static URL = class URL {
        static Main = "https://music.youtube.com";
        static #Gapis = "https://youtubei.googleapis.com";
    
        static #Endpoint = "/youtubei/v1/";
        static #Parameter = "?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"
    
        static #Search = "search";
        static #Suggestion = "get_search_suggestions";
        static #Browse = "browse";
        static #Next = "next";
        static #Audio = "player";
    
        static Search = this.Main + this.#Endpoint + this.#Search + this.#Parameter;
        static Suggestion = this.Main + this.#Endpoint + this.#Suggestion + this.#Parameter;
        static Browse = this.Main + this.#Endpoint + this.#Browse + this.#Parameter;
        static Next = this.Main + this.#Endpoint + this.#Next + this.#Parameter;
        static Audio = this.Main + this.#Endpoint + this.#Audio + this.#Parameter;
        static Stream = this.#Gapis + this.#Endpoint + this.#Audio + this.#Parameter;
    };

    static initialData;
    static initialized = false;
    static initialize() {
        return new Promise((resolve, reject) => {
            if (this.initialized)
                return resolve(true);

            API.getBrowseData("FEmusic_home")
                .then(response => {
                    API.initialData = response;
                    if (API.initialData.picture)
                        UI.setHeader({url: API.initialData.picture});

                    this.initialized = true;
                    resolve(true);
                });
        });
    }

    static async getSearchResults(query, params) {
        let requestBody = API.RequestBody.WEB();
        requestBody.query = query;
        requestBody.params = params;

        let url = API.URL.Search;
        let type = HTTP.Type.Json;
        let input = {
            method: HTTP.Method.POST,
            credentials: "omit",
            headers: HTTP.Headers.Referer,
            body: JSON.stringify(requestBody)
        };

        let response = await HTTP.getResponse(url, input, type);
        return Extractor.digestResultResponse(response);
    }

    static async getSearchSuggestions(query) {
        let requestBody = API.RequestBody.BODY();
        requestBody.input = query;

        let url = API.URL.Suggestion;
        let input = {
            method: HTTP.Method.POST,
            credentials: "omit",
            headers: HTTP.Headers.Referer,
            body: JSON.stringify(requestBody)
        }
        let type = HTTP.Type.Json;

        let response = await HTTP.getResponse(url, input, type);

        console.log(response);
    }

    static getBrowseData(browseId, continuation) {
        return new Promise(async(resolve, reject) => {
            if (browseId == undefined)
                return resolve(null);

            if (API.initialized && browseId == "FEmusic_home")
                resolve(API.initialData);

            //TODO implement continuation
            let requestBody = API.RequestBody.WEB();
            if (continuation && browseId == "FEmusic_home")
                url = url + "&ctoken=" + continuation.continuation + 
                            "&continuation=" + continuation.continuation +
                            "&itct=" + continuation.itct +
                            "&type=next"
            else {
                if (browseId.slice(0, 2) == "RD")
                    browseId = "VL" + browseId;
                
                requestBody.browseId = browseId;
            }

            let url = API.URL.Browse;
            let type = HTTP.Type.Json;
            let input = {
                method: HTTP.Method.POST,
                credentials: "omit",
                headers: HTTP.Headers.Referer,
                body: JSON.stringify(requestBody)
            };

            HTTP.getResponse(url, input, type)
                .then(response => resolve(
                    browseId == "FEmusic_home"
                        ? Extractor.digestHomeResponse(response)
                        : Extractor.digestBrowseResponse(response, browseId)
                ))
                .catch(reason => reject(reason));
        });
    }

    static async getAudioInfo({videoId, playlistId = undefined, controllerCallback = undefined}: {videoId: string, playlistId: string | undefined, controllerCallback: AbortController | undefined}) {
        let requestBody = API.RequestBody.BODY();
        requestBody.videoId = videoId;
        requestBody.playlistId = playlistId;

        let url = API.URL.Audio;
        let type = HTTP.Type.Json;
        let input = {
            method: HTTP.Method.POST,
            credentials: "omit",
            headers: HTTP.Headers.Referer,
            body: JSON.stringify(requestBody)
        };

        let response = await HTTP.getResponse(url, input, type, controllerCallback);
        let audioInfo = Extractor.digestAudioInfoResponse(response);
        return audioInfo;
    }

    static async getAudioStream({videoId, controllerCallback = undefined}: {videoId: string, controllerCallback: AbortController | undefined}) {
        let requestBody = API.RequestBody.BODY();
        requestBody.videoId = videoId;

        let url = API.URL.Stream;
        let type = HTTP.Type.Json;
        let input = {
            method: HTTP.Method.POST,
            credentials: "omit",
            headers: HTTP.Headers.Referer,
            body: JSON.stringify(requestBody)
        };

        let response = await HTTP.getResponse(url, input, type, controllerCallback);
        let trackContent = Extractor.digestStreamResponse(response);
        if (Settings.Values.proxyYTMM || Device.Platform == "web")
            trackContent.url = HTTP.getProxyUrl(trackContent.url)
        
        return trackContent;
    }

    static async getNextSongs({videoId, playlistId}) {
        if (!playlistId) {
            console.log("song radio enabled");
            playlistId = "RDAMVM" + videoId;
        }

        let requestBody = API.RequestBody.BODY();
        requestBody.enablePersistentPlaylistPanel = true;
        requestBody.isAudioOnly = true;
        requestBody.videoId = videoId;
        requestBody.playlistId = playlistId;

        let url = API.URL.Next;
        let type = HTTP.Type.Json;
        let input = {
            method: HTTP.Method.POST,
            credentials: "omit",
            headers: HTTP.Headers.Referer,
            body: JSON.stringify(requestBody)
        };
        
        let response = await HTTP.getResponse(url, input, type);
        let playlist = Extractor.digestNextResponse(response);
        for (let i = 0; i < playlist.list.length; i++) {
            if (playlist.list[i].videoId == videoId) {
                playlist.index = i;
                break;
            }
        }
        
        return playlist;
    }

    static async getBlob({url, controllerCallback}) {
        if (IO.isBlob(url))
            return url;

        let type = HTTP.Type.Blob;
        let input = {
            method: HTTP.Method.GET,
            credentials: "omit",
            headers: HTTP.Headers.Referer
        };
        
        let blob = await HTTP.getResponse(url, input, type, controllerCallback);
        return blob;
    }

    static async getLyrics(track: Track) {
        let artist = track.artist;
        let title = track.title;

        if (artist == undefined || title == undefined)
            return {
                then: () => {return null}
            };

        if (artist.includes("("))
            artist = artist.substring(0, artist.indexOf("(")).trim();

        if (title.includes("("))
            title = title.substring(0, title.indexOf("(")).trim();

        artist = artist.replaceAll(" & ", "+").replaceAll(" ", "+");
        title = title.replaceAll(" & ", "+").replaceAll(" ", "+");
        let requestParams = title + "+" + artist;
        
        let url = window.location.origin + "/lyrics?q=" + requestParams;
        let type = HTTP.Type.Json;
        let input = {
            method: HTTP.Method.GET,
            credentials: "omit",
        };

        return HTTP.getResponse(url, input, type);
    }
}

// type Body = {
//     context: {
//         client: {
//             clientName: string,
//             clientVersion: string,
//             gl: undefined | string,
//             hl: undefined | string
//         }
//     }
// }