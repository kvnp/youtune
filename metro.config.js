// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const connect = require('connect');
const { legacyCreateProxyMiddleware, createProxyMiddleware } = require('http-proxy-middleware');


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
      .use('/proxy/videoplayback', legacyCreateProxyMiddleware({
        target: "https://redirector.googlevideo.com/videoplayback",
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
        target: "https://i.ytimg.com",
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },

        headers: {
          "Referer": "https://www.youtube.com",
          "Origin": "https://www.youtube.com",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0"
        }
      }))
      .use('/proxy', createProxyMiddleware({
        target: 'https://music.youtube.com',
        changeOrigin: true,
        secure: false,
        headers: {
          "Origin": "https://music.youtube.com",
          "Referer": "https://music.youtube.com",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0",
        },
      }))
  },
}

module.exports = config;