import Device from "../device/Device";

export default class HTTP {
    static Headers = class Headers {
        static get Simple() {
            return {
                "User-Agent":
                "Mozilla/5.0 (Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0"
            };
        }
    
        static get Referer() {
            return {
                "Referer":      "https://music.youtube.com/",
                "Content-Type": "application/json"
            };
        }
    }

    static Type = class Type {
        static get Text() {
            return "text";
        }

        static get Blob() {
            return "blob";
        }

        static get Json() {
            return "json";
        }
    }

    static Method = class Method {
        static get GET() {
            return "GET";
        }

        static get POST() {
            return "POST";
        }
    }

    static getProxyUrl(url: string) {
        if (!url.startsWith("http"))
            return url;

        if (typeof window === "undefined")
            window = self;

        if (url.includes(window.location.hostname))
            return url;

        if (url.split("/")[2] == "lh3.googleusercontent.com")
            return window.location.protocol + "//" +
                  window.location.host + "/proxy/lh3/" +
                  url.split("/").slice(3).join("/");
        else
            return window.location.protocol + "//" +
                  window.location.host + "/proxy/" +
                  url.split("/").slice(3).join("/");
    }

    static getResponse(url, input, type, controllerCallback) {
        //TODO implement custom proxy setting
        //Settings.forceProxy
        if (Device.Platform == "web")
            url = this.getProxyUrl(url);
        else if (Device.Platform == "node")
            return this.#nodeFetch(url, input, type);

        return this.#fetch(url, input, type, controllerCallback);
    }

    static #fetch(url, input, type, controllerCallback) {
        if (controllerCallback) {
            let controller = new AbortController();
            let signal = controller.signal;
    
            input = {...input, signal};
            controllerCallback(controller);
        }
        
        return new Promise((resolve, reject) => {
            const attempt = () => {
                fetch(url, input)
                    .then(response => {
                        if (response.status == 200) {
                            if (type == HTTP.Type.Json)
                                resolve(response.json());
                            else if (type == HTTP.Type.Blob)
                                resolve(response.blob());
                            else
                                resolve(response.text());
                        } //else attempt();
                    })

                    .catch(reason => {
                        reject(reason);
                    });
            }

            attempt();
        });
    }

    static #nodeFetch(url, input, type) {
        return new Promise((resolve, reject) => {
            reject("not implemented yet");
        });
    }
}