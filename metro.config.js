// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const connect = require('connect');
const { createProxyMiddleware } = require('http-proxy-middleware');


/** @type { import('expo/metro-config').Config } */
const config = getDefaultConfig(__dirname);
const ALIASES = {
  web: {
    'react-native-linear-gradient': 'react-native-web-linear-gradient',
  }
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: false,
  },
});

config.resolver.unstable_enablePackageExports = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  return context.resolveRequest(
    context,
    // Use an alias if one exists.
    ALIASES[platform] ? ALIASES[platform][moduleName] ?? moduleName : moduleName,
    platform
  );
};

config.server = {
  enhanceMiddleware: (metroMiddleware, metroServer) => {
    return connect()
      .use(metroMiddleware)
      .use('/proxy/videoplayback', createProxyMiddleware({
        target: "https://redirector.googlevideo.com/videoplayback",
        pathRewrite: {'^/proxy' : ''},
        changeOrigin: true,
        secure: false,
        followRedirects: true,
        headers: {
            "Referer": "https://www.youtube.com",
            "Origin": "https://www.youtube.com",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0",
            "Connection": "Keep-Alive"
        }
      }))
      .use('/proxy/lh3', createProxyMiddleware({
        target: "https://lh3.googleusercontent.com",
        changeOrigin: true,
        headers: {
          "Referer": "https://www.youtube.com",
          "Origin": "https://www.youtube.com",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
        }
      }))
      .use('/proxy/vi', createProxyMiddleware({
        target: "https://i.ytimg.com/vi",
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },

        headers: {
          "Referer": "https://www.youtube.com",
          "Origin": "https://www.youtube.com",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
        },
      }))
      .use('/proxy', createProxyMiddleware({
        target: 'https://music.youtube.com',
        followRedirects: true,
        changeOrigin: true,
        secure: false,
        headers: {
          "Origin": "https://music.youtube.com",
          "Referer": "https://music.youtube.com",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0",
        },
        
        on: {
          proxyReq: (proxyReq, req, res) => {
            // if (req.headers.cookie)
            //   req.headers.cookie = req.headers.cookie.replace(/(Domain=.*?;)/, "Domain=.youtube.com");
          },

          proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            if (proxyRes.headers["set-cookie"])
              proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"].map(
                cookie => cookie.replace(
                  /(Domain=.*?;)/,
                  "Domain=" + req.headers.host.split(":")[0]
                )
              );
          }
        }
      }))
  },
}

module.exports = config;