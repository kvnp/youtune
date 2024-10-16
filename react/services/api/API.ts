
import { DeviceEventEmitter, Platform } from "react-native";
import YTMusic, { SearchResult } from "ytmusic-api";

import Extractor from "./Extractor";
import Device from "../device/Device";
import Settings from "../device/Settings";
import HTTP from "./HTTP";
import IO from "../device/IO";
import UI from "../ui/UI";
import Track from "../../model/music/track";

export default class API {
  static #emitter = DeviceEventEmitter;
  static EVENT_API_INITIALIZED = "event-api-initialized";

  static YTMusic = new YTMusic();
  static initialized = 0; // 0: not initialized, 1: initializing, 2: initialized
  static initialize() {
    return new Promise((resolve, reject) => {
      if (this.initialized == 2)
        return resolve(true);
      else if (this.initialized == 1)
        return new Promise((resolve, reject) => {
          API.addListener(API.EVENT_API_INITIALIZED, () => {
            resolve(true);
          })
        });

      const baseURL = Platform.OS == "web"
        ? window.location.origin + "/proxy"
        : "https://music.youtube.com";

      API.YTMusic.initialize({ baseURL })
        .then(_ytm => {
          API.initialized = 2;
          UI.setHeader({ url: API.YTMusic.initialData[1].data.background.musicThumbnailRenderer.thumbnail.thumbnails[0].url });
          this.#emitter.emit(API.EVENT_API_INITIALIZED);
          resolve(true);
        });
    });
  }

  static addListener(event: string, callback: () => void) {
    return API.#emitter.addListener(event, callback);
  }

  static async getSearchResults(query: string, params: any): Promise<SearchResult[]> {
    if (!this.initialized) {
      return new Promise((resolve, reject) => {
        API.addListener(API.EVENT_API_INITIALIZED, () => {
          resolve(API.getSearchResults(query, params));
        })
      });
    }

    let searchResults: SearchResult[] = [
      ...await API.YTMusic.searchSongs(query),
      ...await API.YTMusic.search(query)
    ];
       
    return searchResults;
  }

  static async getSearchSuggestions(query) {
    // let requestBody = API.RequestBody.BODY();
    // requestBody.input = query;

    // let url = API.URL.Suggestion;
    // let input = {
    //     method: HTTP.Method.POST,
    //     credentials: "omit",
    //     headers: HTTP.Headers.Referer,
    //     body: JSON.stringify(requestBody)
    // }
    // let type = HTTP.Type.Json;

    // let response = await HTTP.getResponse(url, input, type);

    // console.log(response);
  }

  static getBrowseData(browseId, continuation) {
    return new Promise(async (resolve, reject) => {
      // if (browseId == undefined)
      //     return resolve(null);

      // if (API.initialized && browseId == "FEmusic_home")
      //     resolve(API.initialData);

      // //TODO implement continuation
      // let requestBody = API.RequestBody.WEB();
      // if (continuation && browseId == "FEmusic_home")
      //     url = url + "&ctoken=" + continuation.continuation + 
      //                 "&continuation=" + continuation.continuation +
      //                 "&itct=" + continuation.itct +
      //                 "&type=next"
      // else {
      //     if (browseId.slice(0, 2) == "RD")
      //         browseId = "VL" + browseId;

      //     requestBody.browseId = browseId;
      // }

      // let url = API.URL.Browse;
      // let type = HTTP.Type.Json;
      // let input = {
      //     method: HTTP.Method.POST,
      //     credentials: "omit",
      //     headers: HTTP.Headers.Referer,
      //     body: JSON.stringify(requestBody)
      // };

      // HTTP.getResponse(url, input, type)
      //     .then(response => resolve(
      //         browseId == "FEmusic_home"
      //             ? Extractor.digestHomeResponse(response)
      //             : Extractor.digestBrowseResponse(response, browseId)
      //     ))
      //     .catch(reason => reject(reason));
      resolve(null);
    });
  }

  static async getAudioInfo({ videoId, playlistId = undefined, controllerCallback = undefined }: { videoId: string, playlistId: string | undefined, controllerCallback: AbortController | undefined }) {
    // let requestBody = API.RequestBody.BODY();
    // requestBody.videoId = videoId;
    // requestBody.playlistId = playlistId;

    // let url = API.URL.Audio;
    // let type = HTTP.Type.Json;
    // let input = {
    //   method: HTTP.Method.POST,
    //   credentials: "omit",
    //   headers: HTTP.Headers.Referer,
    //   body: JSON.stringify(requestBody)
    // };

    // let response = await HTTP.getResponse(url, input, type, controllerCallback);
    // let audioInfo = Extractor.digestAudioInfoResponse(response);
    // return audioInfo;
    return null;
  }

  static async getAudioStream({ videoId, controllerCallback = undefined }: { videoId: string, controllerCallback: AbortController | undefined }) {
    // let requestBody = API.RequestBody.BODY();
    // requestBody.videoId = videoId;

    // let url = API.URL.Stream;
    // let type = HTTP.Type.Json;
    // let input = {
    //   method: HTTP.Method.POST,
    //   credentials: "omit",
    //   headers: HTTP.Headers.Referer,
    //   body: JSON.stringify(requestBody)
    // };

    // let response = await HTTP.getResponse(url, input, type, controllerCallback);
    // let trackContent = Extractor.digestStreamResponse(response);
    // if (Settings.Values.proxyYTMM || Device.Platform == "web")
    //   trackContent.url = HTTP.getProxyUrl(trackContent.url)

    // return trackContent;
    return null;
  }

  static async getNextSongs({ videoId, playlistId }) {
    // if (!playlistId) {
    //   console.log("song radio enabled");
    //   playlistId = "RDAMVM" + videoId;
    // }

    // let requestBody = API.RequestBody.BODY();
    // requestBody.enablePersistentPlaylistPanel = true;
    // requestBody.isAudioOnly = true;
    // requestBody.videoId = videoId;
    // requestBody.playlistId = playlistId;

    // let url = API.URL.Next;
    // let type = HTTP.Type.Json;
    // let input = {
    //   method: HTTP.Method.POST,
    //   credentials: "omit",
    //   headers: HTTP.Headers.Referer,
    //   body: JSON.stringify(requestBody)
    // };

    // let response = await HTTP.getResponse(url, input, type);
    // let playlist = Extractor.digestNextResponse(response);
    // for (let i = 0; i < playlist.list.length; i++) {
    //   if (playlist.list[i].videoId == videoId) {
    //     playlist.index = i;
    //     break;
    //   }
    // }

    // return playlist;
    return null;
  }

  static async getBlob({ url, controllerCallback }) {
    // if (IO.isBlob(url))
    //   return url;

    // let type = HTTP.Type.Blob;
    // let input = {
    //   method: HTTP.Method.GET,
    //   credentials: "omit",
    //   headers: HTTP.Headers.Referer
    // };

    // let blob = await HTTP.getResponse(url, input, type, controllerCallback);
    // return blob;
    return null;
  }

  static async getLyrics(track: Track) {
    // let artist = track.artist;
    // let title = track.title;

    // if (artist == undefined || title == undefined)
    //   return {
    //     then: () => { return null }
    //   };

    // if (artist.includes("("))
    //   artist = artist.substring(0, artist.indexOf("(")).trim();

    // if (title.includes("("))
    //   title = title.substring(0, title.indexOf("(")).trim();

    // artist = artist.replaceAll(" & ", "+").replaceAll(" ", "+");
    // title = title.replaceAll(" & ", "+").replaceAll(" ", "+");
    // let requestParams = title + "+" + artist;

    // let url = window.location.origin + "/lyrics?q=" + requestParams;
    // let type = HTTP.Type.Json;
    // let input = {
    //   method: HTTP.Method.GET,
    //   credentials: "omit",
    // };

    // return HTTP.getResponse(url, input, type);
    return null;
  }
}