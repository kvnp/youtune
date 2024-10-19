const https = require('https');
const jsdom = require("jsdom");

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
        }).on("error", e => {
            reject(e);
        });
    });
}

function getTags(url) {
    return new Promise(async(resolve, reject) => {
        try {
            let html = await get(url);
            let title = null;
            let description = null;
            let image = null;
            if (html != null) {
                html = html.substring(html.indexOf("og:title") + 19);
                title = html.substring(0, html.indexOf('">'));
                html = html.substring(html.indexOf('content="') + 9);
                description = html.substring(0, html.indexOf('">'));
                html = html.substring(html.indexOf('content="') + 9);
                image = html.substring(0, html.indexOf('">'));
            }

            resolve({title, description, image});
        } catch (e) {
            reject(e);
        }
    });
}

function getLyrics(search) {
    return new Promise(async(resolve, reject) => {
        const apiUrl = "https://genius.com/api/search/multi?q=" + search;
        try {
            const searchResponse = JSON.parse(await get(apiUrl));
            for (let e of searchResponse.response.sections) {
                if (e.type == "top_hit") {
                    const lyricsUrl = "https://genius.com" + e.hits[0].result.path;
                    const lyricsHtml = await get(lyricsUrl);
                    const dom = new jsdom.JSDOM(lyricsHtml);
                    let lyricsRoot = dom.window.document.getElementById("lyrics-root");
                    let excludeList = lyricsRoot.querySelectorAll('[data-exclude-from-selection="true"]');
                    for (let exclusion of excludeList) {
                        exclusion.remove();
                    }

                    let lyricsContainerList = lyricsRoot.querySelectorAll('[data-lyrics-container="true"]');
                    let finalHtml = [];
                    for (let container of lyricsContainerList) {
                        finalHtml.push(container.innerHTML);
                    }

                    return resolve(finalHtml.join(""));
                }
            }
        } catch (e) {
            return reject(e);
        }
        
    });
}

module.exports.getTags = getTags;
module.exports.getLyrics = getLyrics;