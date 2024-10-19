export default class IndexedDBProvider {
    static #DB_NAME = "youtune-storage";
    static #read_write = "readwrite";
    static #read_only = "readonly";
    static #db;

    static get #initialized() {
        return this.#db !== undefined
    }

    static initialize() {
        return new Promise((resolve, reject) => {
            var req = indexedDB.open(this.#DB_NAME, 1);

            req.onupgradeneeded = evt => {
                console.log("openDb.onupgradeneeded");

                var result = evt.currentTarget.result;
                var settings = result.createObjectStore("Settings", { keyPath: "setting" });
                settings.createIndex('setting', 'setting', { unique: true });

                var artists = result.createObjectStore("Artists", { keyPath: "channelId" });
                artists.createIndex("channelId", "channelId", { unique: true });

                var playlists = result.createObjectStore("Playlists", { keyPath: "playlistId" });
                playlists.createIndex("playlistId", "playlistId", { unique: true });
                playlists.createIndex("channelId", "channelId", { unique: false });

                var songs = result.createObjectStore("Tracks", { keyPath: "videoId" });
                songs.createIndex("videoId", "videoId", { unique: true });
                songs.createIndex("playlistId", "playlistId", { unique: false });
                songs.createIndex("channelId", "channelId", { unique: false });

                var downloads = result.createObjectStore("Downloads", { keyPath: "videoId" });
                downloads.createIndex("videoId", "videoId", { unique: true });

                var likes = result.createObjectStore("Likes", {keyPath: "videoId"});
                likes.createIndex("videoId", "videoId", { unique: true });
            };

            req.onsuccess = function(evt) {
                resolve(this.result);
            };

            req.onerror = function(evt) {
                console.error("openDb:", evt.target.errorCode);
                reject(evt.target.errorCode);
            };
        });
    }

    static getItem(storeName, key) {
        return new Promise(async(resolve, reject) => {
            if (!this.#initialized)
                this.#db = await this.initialize();

            try {
                this.#db
                    .transaction(storeName, this.#read_only)
                    .objectStore(storeName)
                    .get(key)
                    .onsuccess = function(event) {
                        resolve(event.target.result);
                    };
            } catch (_) {
                this.#db = await this.initialize();
            }
        });
    }

    static setItem(storeName, data) {
        return new Promise(async(resolve, reject) => {
            if (!this.#initialized)
                this.#db = await this.initialize();

            try {
                this.#db
                    .transaction(storeName, this.#read_write)
                    .objectStore(storeName)
                    .put(data)
                    .onsuccess = function(event) {
                        resolve(true);
                    };
            } catch (_) {
                this.#db = await this.initialize();
            }
        });
    }

    static deleteItem(storeName, key) {
        return new Promise(async(resolve, reject) => {
            if (!this.#initialized)
                this.#db = await this.initialize();

            try {
                this.#db
                    .transaction(storeName, this.#read_write)
                    .objectStore(storeName)
                    .delete(key)
                    .onsuccess = function(event) {
                        resolve(true);
                    };
            } catch (_) {
                this.#db = await this.initialize();
            }
            
        });
    }

    static getAllKeys(storeName) {
        return new Promise(async(resolve, reject) => {
            if (!this.#initialized)
                this.#db = await this.initialize();
            
            try {
                this.#db
                    .transaction(storeName, IDBTransaction.READ_ONLY)
                    .objectStore(storeName)
                    .getAllKeys()
                    .onsuccess = function(event) {
                        resolve(event.target.result);
                    }
            } catch (_) {
                this.#db = await this.initialize();
            }
        });
    }
}