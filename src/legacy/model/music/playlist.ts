import Track from "./track";

export default class Playlist {
    list: Array<Track> = [];
    index: number = 0;
    thumbnail: string;
    playlistId: string;
    browseId: string;
    title: string;
    subtitle: string;
    secondSubtitle: string;

    constructor() {
        this.list = [];
        this.index = 0;
        this.thumbnail = "";
        this.playlistId = "";
        this.browseId = "";
        this.title = "";
        this.subtitle = "";
        this.secondSubtitle = "";
    }
}