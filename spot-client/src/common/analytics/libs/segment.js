/* eslint-disable */

/**
 * A snippet provided by Segment which sets a global "analytics" variable
 * for queueing events and asynchronously loads the Segment library, which
 * will eventually consume and replace the global "analytics" variable.
 *
 * @param {string} writeKey - The app key for sending data to a specified
 * source in Segment.
 * @private
 * @returns {void}
 */
function loadGlobalSegment(writeKey) {
    // Create a queue, but don't obliterate an existing one!
    var analytics = window.analytics = window.analytics || [];

    // If the real analytics.js is already on the page return.
    if (analytics.initialize) return;

    // If the snippet was invoked already show an error.
    if (analytics.invoked) {
      if (window.console && console.error) {
        console.error('Segment snippet included twice.');
      }
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    analytics.invoked = true;

    // A list of the methods in Analytics.js to stub.
    analytics.methods = [
      'trackSubmit',
      'trackClick',
      'trackLink',
      'trackForm',
      'pageview',
      'identify',
      'reset',
      'group',
      'track',
      'ready',
      'alias',
      'debug',
      'page',
      'once',
      'off',
      'on'
    ];

    // Define a factory to create stubs. These are placeholders
    // for methods in Analytics.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    analytics.factory = function(method){
      return function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        analytics.push(args);
        return analytics;
      };
    };

    // For each of our methods, generate a queueing stub.
    for (var i = 0; i < analytics.methods.length; i++) {
      var key = analytics.methods[i];
      analytics[key] = analytics.factory(key);
    }

    // Define a method to load Analytics.js from our CDN,
    // and that will be sure to only ever load it once.
    analytics.load = function(key, options){
      // Create an async script element based on your key.
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.segment.com/analytics.js/v1/'
        + key + '/analytics.min.js';

      // Insert our script next to the first script element.
      var first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
      analytics._loadOptions = options;
    };

    // Add a version to keep track of what's in the wild.
    analytics.SNIPPET_VERSION = '4.1.0';

    // Load Analytics.js with your key, which will automatically
    // load the tools you've enabled for your account. Boosh!
    analytics.load(writeKey);

    // Make the first page call to load the integrations. If
    // you'd like to manually name or tag the page, edit or
    // move this call however you'd like.
    // analytics.page();
}

/* eslint-enable */

export default {
    /**
     * Downloads the assets necessary to report data to Segment. The Segment
     * snippet will queue any events that are executed while Segment is
     * still being loaded.
     *
     * @param {string} writeKey - The API key provided by Segment for sending
     * data to a specified source.
     * @returns {void}
     */
    load(writeKey) {
        loadGlobalSegment(writeKey);
    },

    /**
     * Records an "identify" event in Segment.
     *
     * @param {string} userId - A specific user identifier to set on the current
     * instance of Segment.
     * @param {Object} traits - Additional details to associate with the current
     * user.
     * @returns {void}
     */
    identify(userId, traits) {
        window.analytics.identify(userId, traits);
    },

    /**
     * Records a "track" event in Segment.
     *
     * @param {string} event - The name of the current event.
     * @param {Object} properties - Additional details about the event.
     * @returns {void}
     */
    track(event, properties) {
        window.analytics.track(event, properties);
    },

    /**
     * Records a "page" event in Segment.
     *
     * @param {string} name - The name of the viewed page.
     * @param {Object} properties - Additional details about the event.
     * @returns {void}
     */
    page(name, properties) {
        window.analytics.page(/* category */ undefined, name, properties);
    }
};
