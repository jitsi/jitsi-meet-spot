module.exports = {
    opts: {
        destination: './dist/jsdoc',
        recurse: true
    },
    plugins: [],
    source: {
        include: [ 'src' ],
        includePattern: '.+\\.js(doc|x)?$'
    },
    sourceType: 'module',
    tags: {
        allowUnknownTags: true,
        dictionaries: [
            'jsdoc',
            'closure'
        ]
    },
    templates: {
        cleverLinks: false,
        monospaceLinks: false
    }
};
