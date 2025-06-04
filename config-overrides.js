const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "net": false, // Or require.resolve('net-browserify') if you wanted a polyfill
        "tls": false, // Stompjs often tries to use tls alongside net
        "fs": false, // Often appears with net/tls in older libraries
        "path": require.resolve("path-browserify"), // Common polyfill
        "stream": require.resolve("stream-browserify"), // Common polyfill
        "util": require.resolve("util/"), // Common polyfill
        "zlib": require.resolve("browserify-zlib"), // For browserify-zlib
        "assert": require.resolve("assert/"), // For assert
        "buffer": require.resolve("buffer/"), // For buffer
        "process": require.resolve("process/browser"), // For process
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "url": require.resolve("url/")
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    // This is crucial for SockJS and older libraries expecting Node's global object.
    // It injects a global 'Buffer' for older libraries.
    config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false // Disable the fully specified rule for .mjs files if needed
        }
    });

    return config;
};