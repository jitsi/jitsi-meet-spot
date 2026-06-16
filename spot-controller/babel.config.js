module.exports = function(api) {
    api.cache(true);

    return {
        presets: [ 'babel-preset-expo' ],

        // react-native-worklets/plugin powers react-native-reanimated 4 (used by
        // react-native-drawer-layout). It MUST be the last plugin.
        plugins: [ 'react-native-worklets/plugin' ]
    };
};
