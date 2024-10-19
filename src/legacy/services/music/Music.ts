import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import TrackPlayer, { Capability, RepeatMode, Event, State, AppKilledPlaybackBehavior } from 'react-native-track-player';
import Queue from 'queue-promise';
import Downloads from '../device/Downloads';
import Cast from './Cast';
import API from '../api/API';
import Track from '../../model/music/track';
import Playlist from '../../model/music/playlist';

var queueAddCounter = 0;
export default class Music {
    static playbackState: State = State.None;
    static set state(value) {
        this.playbackState = value;
        this.#emitter.emit(this.EVENT_STATE_UPDATE, this.state);
    }

    static get state() {
        return this.playbackState;
    }

    static playbackPosition = 0;
    static set position(value) {
        this.playbackPosition = value;
        this.#emitter.emit(this.EVENT_POSITION_UPDATE, this.position);
    }

    static get position() {
        return this.playbackPosition;
    }

    static #positionInterval: number;
    static #positionListener: EmitterSubscription;
    static isStreaming = false;

    static repeatMode: RepeatMode = RepeatMode.Off;
    static get repeatModeString() {
        if (this.repeatMode == RepeatMode.Off)
            return "repeat";
        else if (this.repeatMode == RepeatMode.Queue)
            return "repeat-on";
        else
            return "repeat-one-on";
    }

    static metadataList: Array<Track> = [];
    static get list() {return this.metadataList;}
    static set list(array) {
        this.metadataList = array;
        this.#emitter.emit(this.EVENT_QUEUE_UPDATE, this.metadataList);
    };

    static metadataIndex = 0;
    static set index(value) {
        this.metadataIndex = value;
        this.#emitter.emit(this.EVENT_METADATA_UPDATE, this.metadata);
    }

    static get index() {
        return this.metadataIndex;
    }

    static playlistId: string;
    static trackUrlLoaded: Array<boolean> = [];

    static transitionTrack: Track | null;
    static set transition(value) {
        this.transitionTrack = value;
        if (value)
            this.#emitter.emit(this.EVENT_METADATA_UPDATE, value);
    }

    static get transition() {
        return this.transitionTrack;
    }

    static get metadata() {
        if (Music.list.length == 0)
            return Music.transition
                ? Music.transition
                : Track.new();
        else
            return Music.list[Music.index];
    }

    static wasPlayingBeforeSkip = false;

    static #emitter = DeviceEventEmitter;
    static EVENT_METADATA_UPDATE = "event-metadata-update";
    static EVENT_POSITION_UPDATE = "event-position-update";
    static EVENT_STATE_UPDATE = "event-state-update";
    static EVENT_QUEUE_UPDATE = "event-queue-update";

    static audioContext: AudioContext;

    static TrackPlayerTaskProvider() {
        return async function() {
            TrackPlayer.addEventListener(Event.PlaybackState, params => {
                if (Music.isStreaming)
                    return clearInterval(Music.#positionInterval)

                if (params.state != State.Playing) {
                    clearInterval(Music.#positionInterval);
                    TrackPlayer.getProgress()
                        .then(progress => Music.position = progress.position);
                } else if (params.state != Music.state) {
                    Music.#positionInterval = window.setInterval(async() =>
                        Music.position = (await TrackPlayer.getProgress()).position
                    , 500);
                }
                
                if (!Music.metadata.videoId)
                    return;
                
                Music.state = params.state;
            });
    
            TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, params => {
                if (Music.isStreaming)
                    return;

                if (Music.index != params.index) {
                    Music.index = params.index!;
                    Music.position = 0;
                }

                if (params.index) {
                    if (params.index < Music.list.length && params.index >= 0) {
                        if (!Music.trackUrlLoaded[params.index])
                            Music.enqueue(params.index);
                        else
                            Music.play();
                    }

                    for (let i = params.index + 1; i < params.index + 2; i++) {
                        if (i >= Music.list.length)
                            break;
                        
                        if (!Music.trackUrlLoaded[i])
                            Music.enqueue(i);
                    }
                }
            });
    
            TrackPlayer.addEventListener(Event.PlaybackQueueEnded, params => {
                //console.log(Event.PlaybackQueueEnded);
                //console.log(params);
            });
    
            TrackPlayer.addEventListener(Event.PlaybackError, params => {
                console.log(Event.PlaybackError);
                console.log(params);
                /*TrackPlayer.seekTo(0).then(() => {
                    TrackPlayer.play();
                });*/
            });
    
            TrackPlayer.addEventListener(Event.RemoteNext, () => {
                Music.skipNext();
            });
    
            TrackPlayer.addEventListener(Event.RemotePrevious, () => {
                Music.skipPrevious();
            });
    
            TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    
            TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    
            TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
    
            TrackPlayer.addEventListener(Event.RemoteSeek, params => {
                TrackPlayer.seekTo( ~~(params.position) );
            });
    
            TrackPlayer.addEventListener(Event.RemoteJumpForward, async() => {
                const progress = await TrackPlayer.getProgress();
                let position = progress.position;
                let duration = progress.duration;
                position += 10;
                if (position > duration) position = duration;
    
                TrackPlayer.seekTo(position);
            });
    
            TrackPlayer.addEventListener(Event.RemoteJumpBackward, async() => {
                let position = (await TrackPlayer.getProgress()).position;
                position -= 10;
                if (position < 0)
                    position = 0;
    
                TrackPlayer.seekTo(position);
            });
        }
    };

    static #queue = new Queue({
        concurrent: 5,
        interval: 1
    });

    static addListener(event: string, listener: (data: any) => void): EmitterSubscription {
        return Music.#emitter.addListener(event, listener);
    }

    static play() {
        if (Music.isStreaming)
            Cast.play();
        else {
            if (Music.audioContext)
                Music.audioContext.resume();
            TrackPlayer.play();
        }
    }

    static enqueue(index: number) {
        Music.#queue.enqueue(() => {
            return new Promise(async(resolve, reject) => {
                let track = Music.list[index];
                track = {
                    ...track,
                    ...(await API.getSong(track.videoId))
                }
                resolve(track);
            });
        });
    }

    static pause() {
        if (Music.isStreaming)
            Cast.pause();
        else
            TrackPlayer.pause();
    }

    static reset(dontResetTransition: boolean) {
        return new Promise((resolve, reject) => {
            if (!Music.isStreaming)
                TrackPlayer.reset();

            Music.#queue.clear();
            if (dontResetTransition)
                Music.state = State.Buffering;
            else {
                Music.state = State.None;
                Music.transition = null;
            }

            Music.list = [];
            Music.index = 0;
            Music.position = 0;
            resolve(null);
        });
    }

    static seekTo(position: number) {
        Music.position = position;
        if (Music.isStreaming)
            Cast.seekTo(position);
        else {
            TrackPlayer.seekTo(position);
            clearInterval(Music.#positionInterval);
            Music.#positionInterval = window.setInterval(async() =>
                Music.position = await TrackPlayer.getPosition()
            , 500);
        }
    }

    static initialize() {
        return new Promise(async(resolve, reject) => {
            TrackPlayer.registerPlaybackService(Music.TrackPlayerTaskProvider);
            await TrackPlayer.setupPlayer({
                
            });
            await TrackPlayer.updateOptions(TrackPlayerOptions);
            TrackPlayer.setRepeatMode(Music.repeatMode);

            Music.#queue.on("reject", error => console.log(error));
            Music.#queue.on("resolve", async(track) => {
                if (!Music.list?.length || Music.state == State.None)
                    return;

                let trackIndex = -1;
                for (let i = 0; i < Music.list.length; i++) {
                    if (Music.list[i].videoId == track.videoId) {
                        trackIndex = i;
                        break;
                    }
                }

                if (trackIndex == -1)
                    return;

                await TrackPlayer.remove(trackIndex);
                await TrackPlayer.add(track, trackIndex);
                Music.trackUrlLoaded[trackIndex] = true;
                if (Music.index == trackIndex)
                    Music.skip(trackIndex);
            });

            Cast.initialize();
            Cast.addListener(Cast.EVENT_CAST, e => {
                // if (e.castState == "CONNECTED") {
                //     if (!Music.isStreaming) {
                //         Music.isStreaming = true;
                //         TrackPlayer.reset();
                //         clearInterval(Music.#positionInterval);

                //         Music.#positionListener = Cast.addListener(
                //             Cast.EVENT_POSITION,
                //             (pos: number) => Music.position = pos
                //         );
                //     }
                // } else {
                //     if (!Music.isStreaming)
                //         return;

                //     Music.isStreaming = false;
                //     Music.#positionListener.remove();
                //     if (Music.list.length > 0)
                //         Music.startPlaylist({
                //             list: Music.list,
                //             index: Music.index
                //         }, Music.position);
                // }
            });

            Cast.addListener(Cast.EVENT_PLAYERSTATE, e => {
                Music.state = e;
            });

            resolve(null);
        });
    }

    static async add(track: Track, trackIndex: number) {
        return new Promise((resolve, reject) => {
            TrackPlayer.add(track, trackIndex).then(() => {
                track.videoId = track.videoId + "&" + queueAddCounter++;
                Music.list = [
                    ...Music.list.slice(0, trackIndex),
                    track,
                    ...Music.list.slice(trackIndex)
                ];

                Music.trackUrlLoaded = [
                    ...Music.trackUrlLoaded.slice(0, trackIndex),
                    false,
                    ...Music.trackUrlLoaded.slice(trackIndex)
                ];

                resolve(null);
            });
        });
    };

    static remove(trackIndex: number) {
        return new Promise((resolve, reject) => {
            TrackPlayer.remove(trackIndex).then(() => {
                Music.list = [
                    ...Music.list.slice(0, trackIndex),
                    ...Music.list.slice(trackIndex)
                ];

                Music.trackUrlLoaded = [
                    ...Music.trackUrlLoaded.slice(0, trackIndex),
                    ...Music.trackUrlLoaded.slice(trackIndex)
                ];

                resolve(null);
            });
        });
    };

    static cycleRepeatMode() {
        if (Music.repeatMode == RepeatMode.Off)
            Music.repeatMode = RepeatMode.Queue;
        else if (Music.repeatMode == RepeatMode.Queue)
            Music.repeatMode = RepeatMode.Track;
        else // if (Music.repeatMode == RepeatMode.Track)
            Music.repeatMode = RepeatMode.Off;
        
        TrackPlayer.setRepeatMode(Music.repeatMode);
        return Music.repeatModeString;
    }

    static skipTo(index: number) {
        if (index == null || Music.list == null)
            return;

        let forward;
        if (index < 0) {
            if (Music.repeatMode == RepeatMode.Queue) {
                index = Music.list.length - 1;
                forward = false;
            } else
                index = 0;
        } else if (index + 1 > Music.list.length) {
            if (Music.repeatMode == RepeatMode.Queue) {
                index = 0;
                forward = true;
            } else
                index = Music.list.length - 1;
        }
        
        forward = forward != undefined
            ? forward
            : index > Music.index;

        if (!forward && Music.position >= 10)
            return Music.seekTo(0)
        
        if (Music.trackUrlLoaded[Music.index])
            Music.skip(index);
        else {
            if (!Music.isStreaming)
                Music.enqueue(Music.index);
            else
                Music.skip(index);
        }
    }

    static skip(index: number) {
        if (Music.isStreaming) {
            Music.index = index;
            Cast.cast();
        } else TrackPlayer.skip(index);
    }
    
    static skipNext() {Music.skipTo(Music.index + 1)}
    static skipPrevious() {Music.skipTo(Music.index - 1)}

    static async handlePlayback(track: Track, forced: boolean) {
        Music.transition = track;
        const {videoId, playlistId } = track;
        let queue = Music.list;

        if (forced)
            Music.reset(true);
        else
            if (queue.length > 0) {
                let track = Music.metadata;

                if (playlistId == track.playlistId) {
                    if (track.videoId == videoId)
                        return;
                    
                    for (let i = 0; i < queue.length; i++) {
                        if (queue[i].videoId == videoId)
                            return Music.skip(i);
                    }
                }
                
                Music.reset(true);
            }

        let local = false;
        if (typeof playlistId == "string")
            if (playlistId.startsWith("LOCAL"))
                local = true;

        if (local) Downloads.getPlaylist(playlistId, videoId)
            .then(localPlaylist => {
                if (localPlaylist != null)
                    Music.startPlaylist(localPlaylist, 0);
                
            })
            .catch(console.error);
        else API.waitForInitialization().then(() => {
            API.getNextSongs(videoId, playlistId!)
            .then(tracks => {
                let resultPlaylist = new Playlist();
                resultPlaylist.list = tracks;
                resultPlaylist.index = 0;
                Music.startPlaylist(resultPlaylist, 0);
            })
            .catch(console.error);
        });
    }

    static async startPlaylist(playlist: Playlist, position: number) {
        Music.trackUrlLoaded = Array(playlist.list.length).fill(false);
        Music.list = playlist.list;
        Music.index = playlist.index;
        Music.list[Music.index] = {
            ...Music.list[Music.index],
            ...(await API.getSong(Music.list[Music.index].videoId))
        };
        Music.trackUrlLoaded[Music.index] = true;

        // for (let i = 0; i < playlist.list.length; i++) {
        //     if (i == playlist.index)
        //         Music.index = i;

        //     if (i == playlist.index || i == playlist.index + 1) {
        //         if (!Downloads.isTrackDownloaded(Music.list[i].videoId)) {
        //             Music.list[i] = {
        //                 ...Music.list[i],
        //                 ...(await API.getSong(Music.list[i].videoId))
        //             };
        //         }
                
        //         Music.trackUrlLoaded[i] = true;
        //     }

        //     if (i == Music.index + 1)
        //         break;
        // }

        if (!Music.isStreaming) {
            if (Music.list.length <= 0) {
                console.error("No tracks to play");
            }

            await TrackPlayer.add(Music.list);
            await TrackPlayer.skip(Music.index);
            if (position)
                await TrackPlayer.seekTo(position);

            Music.play();
        } else Cast.cast();
    }
}

const TrackPlayerOptions = {
    android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
    },
    alwaysPauseOnInterruption: true,

    capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo
    ],

    notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo
    ],

    compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
    ]
};