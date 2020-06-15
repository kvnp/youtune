export async function fetchResults(query) {
    const apikey = await getApiKey();
    const url = "https://music.youtube.com/youtubei/v1/search?alt=json&key=" + apikey;
    const body = {
        "context": {
            "client": {
                "clientName": "WEB_REMIX",
                "clientVersion": "0.1"
            }
        },
        "query": query
    };

    const headers = {
        'Referer': "https://music.youtube.com/",
        'Content-Type': 'application/json'
    };

    let response = await getFetchResponse(url, {method: 'POST',
                                                headers: headers,
                                                body: JSON.stringify(body)}, "json");
    
    return digestSearchResults(response);
}

export async function fetchHome() {
    const apikey = await getApiKey();
    const url = "https://music.youtube.com/youtubei/v1/browse?alt=json&key=" + apikey;
    const body = {
        "context": {
            "client": {
                "clientName": "WEB_REMIX",
                "clientVersion": "0.1"
            }
        },
        "browseId": "FEmusic_home"
    }

    const headers = {
        'Referer': "https://music.youtube.com/",
        'Content-Type': 'application/json'
    };

    let response = await getFetchResponse(url, {method: 'POST',
                                                headers: headers,
                                                body: JSON.stringify(body)}, "json");

    return digestHomeResults(response);
}

export async function fetchVideo(id) {
    const url = "https://www.youtube.com/watch?v=" + id;

    let response = await getFetchResponse(url, {method: 'GET'}, "text");

    let begin = response.indexOf("ytplayer.config = ") + 18;
    let end = response.indexOf(";ytplayer.web_player");
    //let end = response.indexOf(";ytplayer.load");
    
    let slice = response.substring(begin, end);
    let ytJson = JSON.parse(slice);
    let ytPlayer = JSON.parse(ytJson.args.player_response)
    let videoList = ytPlayer.streamingData.adaptiveFormats;
    return videoList;
}

async function getApiKey() {
    if (global.apikey == null) {
        const headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0'}
        let text = await getFetchResponse("https://music.youtube.com/", {method: 'GET', headers: headers}, "text");

        text = text.slice(text.indexOf("INNERTUBE_API_KEY\":\"")+20);
        global.apikey = text.slice(0, text.indexOf("\""));
        console.log(global.apikey);
    }
    return global.apikey;
}

async function getFetchResponse(url, input, type) {
    const response = await fetch(url, input);
    switch(type) {
        case "json":
            return response.json();
        case "text":
            return response.text();
    }
}

function digestSearchResults(json) {
    let final = {results: 0, suggestion: [], topics: []};

    if (json.contents.sectionListRenderer.contents[0].hasOwnProperty("itemSectionRenderer")) {
        if (json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].hasOwnProperty("messageRenderer")) {
            if (json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].messageRenderer.text.runs[0].text === "No results found") {
                return final;
            }
        } else if (json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].hasOwnProperty("didYouMeanRenderer")) {
            for (let i = 0; i < json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].didYouMeanRenderer.correctedQuery.runs.length; i++) {
                let text = json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].didYouMeanRenderer.correctedQuery.runs[i].text;

                if (json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].didYouMeanRenderer.correctedQuery.runs[i].hasOwnProperty("italics")) {
                    let italics = json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].didYouMeanRenderer.correctedQuery.runs[i].italics;
                    final.suggestion.push({text: text, italics: italics});
                } else {
                    final.suggestion.push({text: text, italics: false});
                }
            }
        }
    }

    let musicshelves = [];

    for (let x = 0; x < json.contents.sectionListRenderer.contents.length; x++) {
        if (json.contents.sectionListRenderer.contents[x].hasOwnProperty("musicShelfRenderer")) {
            musicshelves.push(json.contents.sectionListRenderer.contents[x].musicShelfRenderer);
        }
    }
    final.results = musicshelves.length;

    for (let i = 0; i < musicshelves.length; i++) {
        final.topics.push({});
        final.topics[i].topic = musicshelves[i].title.runs[0].text;
        console.log(final.topics[i].topic = musicshelves[i].title.runs[0].text);
        final.topics[i].elements = [];
        for (let j = 0; j < musicshelves[i].contents.length; j++) {
            console.log(j + ": " + musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text);
            if (musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text === "Song") {
                final.topics[i].elements.push({});
                final.topics[i].elements[j].type = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].title = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].interpret = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].album = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].length = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[4].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].videoId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchEndpoint.videoId;
                final.topics[i].elements[j].playlistId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchEndpoint.playlistId;
                final.topics[i].elements[j].thumb = musicshelves[i].contents[j].musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[1].url;

            } else if (musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text === "Single") {
                final.topics[i].elements.push({});
                final.topics[i].elements[j].type = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].title = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].interpret = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].year = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].playlistId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchPlaylistEndpoint.playlistId;
                //console.log("\n\n" + musicshelves[i].contents[j].musicResponsiveListItemRenderer.thumbnail + "\n\n");
                final.topics[i].elements[j].thumb = musicshelves[i].contents[j].musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[1].url;

            } else if (musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text === "Video") {
                final.topics[i].elements.push({});
                final.topics[i].elements[j].type = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].title = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].interpret = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].views = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].length = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[4].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
                final.topics[i].elements[j].videoId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchEndpoint.videoId;
                final.topics[i].elements[j].playlistId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchEndpoint.playlistId;
                final.topics[i].elements[j].thumb = musicshelves[i].contents[j].musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[1].url;

            } else if (musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text === "Playlist") {
                final.topics[i].elements.push({});
                final.topics[i].elements[j].type = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].title = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].subtitle = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].songsText = musicshelves[i].contents[j].musicResponsiveListItemRenderer.flexColumns[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
                final.topics[i].elements[j].playlistId = musicshelves[i].contents[j].musicResponsiveListItemRenderer.doubleTapCommand.watchPlaylistEndpoint.playlistId;
                final.topics[i].elements[j].thumb = musicshelves[i].contents[j].musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[1].url;
            }
        }
    }
    return final;
}

function digestHomeResults(json) {
    let contentList = json.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;

    let final = {background: null, shelves: []};
    for (let i = 0; i < contentList.length; i++) {
        let shelf = {title: "", albums: []};
        let shelfRenderer;

        if (contentList[i].hasOwnProperty("musicImmersiveCarouselShelfRenderer")) {
            shelfRenderer = contentList[i].musicImmersiveCarouselShelfRenderer;

            let index = shelfRenderer.backgroundImage.simpleVideoThumbnailRenderer.thumbnail.thumbnails.length - 1;
            final.background = shelfRenderer.backgroundImage.simpleVideoThumbnailRenderer.thumbnail.thumbnails[index].url;

        } else if (contentList[i].hasOwnProperty("musicCarouselShelfRenderer")) {
            shelfRenderer = contentList[i].musicCarouselShelfRenderer;

        } else continue;

        for (let j = 0; j < shelfRenderer.header.musicCarouselShelfBasicHeaderRenderer.title.runs.length; j++) {
            shelf.title += shelfRenderer.header.musicCarouselShelfBasicHeaderRenderer.title.runs[j].text;
        }

        for (let j = 0; j < shelfRenderer.contents.length; j++) {
            let album = {thumbnail: "", title: "", subtitle: "", browseId: ""};
            
            for (let k = 0; k < shelfRenderer.contents[j].musicTwoRowItemRenderer.title.runs.length; k++) {
                album.title += shelfRenderer.contents[j].musicTwoRowItemRenderer.title.runs[k].text;
            }

            for (let k = 0; k < shelfRenderer.contents[j].musicTwoRowItemRenderer.subtitle.runs.length; k++) {
                album.subtitle += shelfRenderer.contents[j].musicTwoRowItemRenderer.subtitle.runs[k].text;
            }

            //album.browseId = shelfRenderer.contents[j].musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseId;

            album.thumbnail = shelfRenderer.contents[j].musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails[0].url;

            //console.log(shelfRenderer.contents[j].musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseEndpointContextSupportedConfigs.browseEndpointContextMusicConfig.pageType);

            shelf.albums.push(album);
        }
        
        final.shelves.push(shelf);
    }
    
    return final;
}