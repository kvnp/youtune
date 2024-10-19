const express = require('express');
const path = require('path');
const fs = require("fs");
const { legacyCreateProxyMiddleware } = require('http-proxy-middleware');
const { getTags, getLyrics } = require("./request");
const app = express();

const html = fs.readFileSync("web/public/index.html").toString();
const headIndex = html.indexOf("<head>") + 6;

app.use(express.static(path.join(__dirname, 'public')));
app.get("/watch/", function(req, res, next) {
    const v = req.query.v;
    const url = "https://music.youtube.com/watch?v=" + v;
    getTags(url)
        .then(({title, description, image}) => {
            title = title.split("-").slice(0, -1).join(" ").trim();
            description = description.split("·")[1].trim();

            res.setHeader("Content-Type", "text/html");
            const tags = `<meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">`;
            res.send(html.substring(0, headIndex) + tags + html.substring(headIndex));
        })
        .catch(err => res.send({err}));
});

app.get("/lyrics/", function(req, res, next) {
    getLyrics(req.query.q)
        .then(lyrics => res.send({lyrics: lyrics.split("<br>")}))
        .catch(err => res.send({lyrics: [], error: err}));
});

app.get("/playlist/", function(req, res, next) {
    const list = req.query.list;
    const url = "https://music.youtube.com/playlist?list=" + list;
    getTags(url)
        .then(value => {
            res.setHeader("Content-Type", "text/html");
            const tags = `<meta property="og:title" content="${value.title}">
            <meta property="og:description" content="${value.description}">
            <meta property="og:image" content="${value.image}">`;
            res.send(html.substring(0, headIndex) + tags + html.substring(headIndex));
        })
        .catch(err => res.send({err}));
});

app.use('/proxy/videoplayback', legacyCreateProxyMiddleware({
    target: "https://redirector.googlevideo.com",
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    headers: {
        "Referer": "https://www.youtube.com",
        "Origin": "https://www.youtube.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0",
        "Connection": "Keep-Alive"
    },
    pathRewrite: {'^/proxy' : ''}
}));

app.use('/proxy/lh3', legacyCreateProxyMiddleware({
    target: "https://lh3.googleusercontent.com",
    changeOrigin: true,
    pathRewrite: {'^/proxy/lh3/' : ''},

    headers: {
        "Referer": "https://www.youtube.com",
        "Origin": "https://www.youtube.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
    }
}));

app.use('/proxy/vi', legacyCreateProxyMiddleware({
    target: "https://i.ytimg.com",
    changeOrigin: true,
    pathRewrite: {'^/proxy' : ''},

    headers: {
        "Referer": "https://www.youtube.com",
        "Origin": "https://www.youtube.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
    }
}));

app.use('/proxy', legacyCreateProxyMiddleware({
    target: "https://music.youtube.com",
    changeOrigin: true,
    pathRewrite: {'^/proxy' : ''},

    headers: {
        "Referer": "https://music.youtube.com",
        "Origin": "https://music.youtube.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
    }
}));

app.get('*', function(req, res, next) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

module.exports = app;