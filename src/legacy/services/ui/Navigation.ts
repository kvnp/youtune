import { router } from 'expo-router'

type MediaType = {
    browseId: string;
    playlistId: string;
    videoId: string;
}

export default class Navigation {
    static navigate(pathname: string, paramsObject: object) {
        const path = "/" + pathname;
        const params = Object.entries(paramsObject).map(([key, value]) => key + "=" + value).join("&");
        const location = path + "?" + params;
        if (pathname == "watch") {
            console.log("Navigating to " + location);
            // @ts-ignore - router is not typed
            router.navigate(location);
        } else {
            console.log("Pushing to " + location);
            // @ts-ignore - router is not typed
            router.push(location);
        }
    }

    static showPlaylist(browseId: string) {
        const playlistId = browseId.slice(0, 2) == "UC"
            ? browseId.slice(2)
            : browseId;
        
        this.navigate("playlist", {list: playlistId});
    }

    static showArtist(browseId: string) {
        this.navigate("channel", {channelId: browseId});
    }

    static handleMedia(media: MediaType) {
        const { browseId, playlistId, videoId } = media;
    
        if (videoId != undefined && playlistId != undefined) {
            return this.navigate("watch", {v: videoId, list: playlistId});
        } else if (videoId != undefined && browseId != undefined) {
            if (browseId.slice(0, 2) == "VL") {
                return this.navigate("watch", {v: videoId, list: browseId.slice(2)});
            }
        } else if (videoId != undefined) {
            return this.navigate("watch", {v: videoId});
        }
    
        if (browseId != undefined) {
            if (browseId.slice(0, 2) == "UC")
                return this.showArtist(browseId);
            else
                return this.showPlaylist(browseId);
        }
    
        if (playlistId != undefined) {
            return this.showPlaylist(playlistId);
        }
    }

    static playLocal(localPlaylistId) {
        this.navigate("watch", {list: localPlaylistId});
    }
}