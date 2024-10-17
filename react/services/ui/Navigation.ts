import Playlist from "../../model/music/playlist";
import Track from "../../model/music/track";
import Music from "../music/Music";

export default class Navigation {
    static transitionPlaylist: Playlist = Object.create({});

    static #navigate(goal, params, navigation) {
        if (goal == "Artist" || goal == "Playlist")
            navigation.push(goal, params);
        else
            navigation.navigate(goal, params);
    }

    static #showPlaylist(browseId, navigation) {
        const playlistId = browseId.slice(0, 2) == "UC"
            ? browseId.slice(2)
            : browseId;
        
        this.#navigate("Playlist", {list: playlistId}, navigation);
    }

    static #showArtist(browseId, navigation) {
        this.#navigate("Artist", {channelId: browseId}, navigation);
    }

    static handleMedia(media, forced, navigation) {
        const { browseId, playlistId, videoId } = media;
    
        if (videoId != undefined && playlistId != undefined) {
            const track = Track.new();
            track.id = videoId;
            track.videoId = videoId;
            track.playlistId = playlistId;
            Music.handlePlayback(track, forced);
            return this.#navigate("Music", {v: videoId, list: playlistId}, navigation);
        } else if (videoId != undefined && browseId != undefined) {
            if (browseId.slice(0, 2) == "VL") {
                const track = Track.new();
                track.id = videoId;
                track.videoId = videoId;
                track.playlistId = browseId.slice(2);
                Music.handlePlayback(track, forced);
                return this.#navigate("Music", {v: videoId, list: browseId.slice(2)}, navigation);
            }
        } else if (videoId != undefined) {
            const track = Track.new();
            track.id = videoId;
            track.videoId = videoId;
            Music.handlePlayback(track, forced);
            return this.#navigate("Music", {v: videoId}, navigation);
        }
    
        if (browseId != undefined) {
            if (browseId.slice(0, 2) == "UC")
                return this.#showArtist(browseId, navigation);
            else
                return this.#showPlaylist(browseId, navigation);
        }
    
        if (playlistId != undefined) {
            return this.#showPlaylist(playlistId, navigation);
        }
    }

    static playLocal(localPlaylistId) {
        this.navigate("Music", {list: localPlaylistId});
    }
}