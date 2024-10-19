import { Platform } from "react-native";
import { NextResult, SongDetailed, SongFull } from "ytmusic-api";

type TrackData = {
    id: string;
    url: string | null;
    mimeType: string | null;
    duration: number | null;
    title: string;
    artist: string;
    album: string | null;
    date: string | null;
    rating: boolean | null;
    artwork: string;

    videoId: string;
    albumId: string | null;
    playlistId: string | null;
    artistId: string | null;
}

export default class Track {
    id: string;
    url: string | null;
    mimeType: string | null;
    duration: number | null;
    title: string;
    artist: string;
    album: string | null;
    date: string | null;
    rating: boolean | null;
    artwork: string;

    videoId: string;
    albumId: string | null;
    playlistId: string | null;
    artistId: string | null;

    constructor(data: TrackData) {
        this.id = data.id;
        this.url = data.url;
        this.mimeType = data.mimeType;
        this.duration = data.duration;
        this.title = data.title;
        this.artist = data.artist;
        this.album = data.album;
        this.date = data.date;
        this.rating = data.rating;
        this.artwork = data.artwork;

        this.videoId = data.videoId;
        this.albumId = data.albumId;
        this.playlistId = data.playlistId;
        this.artistId = data.artistId;
    }

    static new() {
        return new Track({
            id: "",
            url: null,
            mimeType: null,
            duration: null,
            title: "",
            artist: "",
            album: null,
            date: null,
            rating: null,
            artwork: "",

            videoId: "",
            albumId: null,
            playlistId: null,
            artistId: null
        });
    }

    static fromNextResult(nextResult: NextResult) {
        return new Track({
            id: nextResult.videoId,
            url: null,
            mimeType: null,
            duration: null,
            title: nextResult.name,
            artist: nextResult.artist.name,
            album: null,
            date: null,
            rating: null,
            artwork: nextResult.thumbnails[nextResult.thumbnails.length - 1].url,

            videoId: nextResult.videoId,
            albumId: null,
            playlistId: nextResult.playlistId,
            artistId: nextResult.artist.artistId
        });
    }

    static fromSongDetailed(songResult: SongDetailed) {
        return new Track({
            id: songResult.videoId,
            url: null,
            mimeType: null,
            duration: songResult.duration,
            title: songResult.name,
            artist: songResult.artist.name,
            album: songResult.album ? songResult.album.name : null,
            date: null,
            rating: null,
            artwork: songResult.thumbnails[songResult.thumbnails.length - 1].url,

            videoId: songResult.videoId,
            albumId: songResult.album ? songResult.album.albumId : null,
            playlistId: null,
            artistId: songResult.artist.artistId
        });
    }

    static fromSongFullResult(songResult: SongFull) {
        const format = Track.getHighestiTagFormat(songResult.formats);
        const parsedUrl = new URL(format.url);
        // TODO custom proxy
        if (Platform.OS == "web") {
            if (window.location.host != parsedUrl.host) {
                format.url = window.location.origin
                    + "/proxy"
                    + parsedUrl.pathname
                    + parsedUrl.search
            }
        }

        return new Track({
            id: songResult.videoId,
            url: format.url,
            mimeType: format.mimeType,
            duration: songResult.duration,
            title: songResult.name,
            artist: songResult.artist.name,
            album: null,
            date: null,
            rating: null,
            artwork: songResult.thumbnails[songResult.thumbnails.length - 1].url,

            videoId: songResult.videoId,
            albumId: null,
            playlistId: null,
            artistId: songResult.artist.artistId
        });
    }

    static reduceAdaptiveFormats(formats: AdaptiveFormat[]): AdaptiveFormatAudio[] {
        let reduce: any[] = [];
        for (const format of formats) {
            if (format.mimeType.startsWith("audio"))
                reduce.push(format);
        }
        return reduce;
    }

    static getHighestiTagFormat(formats: AdaptiveFormat[]): AdaptiveFormat {
        let highest = 0;
        let index = 0;
        for (let i = 0; i < formats.length; i++) {
            if (formats[i].itag > highest) {
                highest = formats[i].itag;
                index = i;
            }
        }

        return formats[index];
    }

    static getUrlFromAdaptiveAudioFormats(formats: AdaptiveFormatAudio[]): string {
        const reduce = Track.reduceAdaptiveFormats(formats);
        const highest = Track.getHighestiTagFormat(reduce);
        return highest.url;
    }
}

// SongResult from ytmusic-api
type SongResult = {
    type: "SONG";
    name: string;
    videoId: string;
    artist: {
        artistId: string | null;
        name: string;
    };
    duration: number;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    formats: any[];
    adaptiveFormats: any[];
}

type AdaptiveFormat = AdaptiveFormatVideo | AdaptiveFormatAudio;

type AdaptiveFormatVideo = {
    itag: number,
    url: string,
    mimeType: string,
    bitrate: number,
    width: number,
    height: number,
    initRange: {
        start: string,
        end: string
    },
    indexRange: {
        start: string,
        end: string
    },
    lastModified: string,
    contentLength: string,
    quality: string,
    fps: number,
    qualityLabel: string,
    projectionType: string,
    averageBitrate: number,
    colorInfo: {
        primaries: string,
        transferCharacteristics: string,
        matrixCoefficients: string
    },
    approxDurationMs: number
}

type AdaptiveFormatAudio = {
    itag: number,
    url: string,
    mimeType: string,
    bitrate: number,
    initRange: {
        start: string,
        end: string
    },
    indexRange: {
        start: string,
        end: string
    },
    lastModified: string,
    contentLength: string,
    quality: string,
    projectionType: string,
    averageBitrate: number,
    audioQuality: string,
    approxDurationMs: string,
    audioSampleRate: string,
    audioChannels: number
}