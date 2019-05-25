# Style guide

This is the style-guideline for the sub-repo spot-client. However the style of the characters of the code and formatting isn't really enforced...although the jitsi-meet linting rules are re-used. This documents is aimed to help understand the design choices made in implementing spot-client, ie the style of the architecture.

### Add documentation to prevent tribal knowledge
As the Spot repo grew, little quirks became little, obscure quirks. Add documentation when it seems necessary to make sure future developers can understand a feature. Also, do not be afraid to completely delete documentation.

### Commit tests eventually
In its defense, the philosophy is not "avoid tests." Spot started with no set product spec and continues to operate without one while facing strict deadlines. It's possible the product can change rapidly and features torn down without time to rebuild. As a result, committing tests has generally been avoided until there's some settling down with the feature and code-implementation. Once an implementation is known, tests should be committed. This should be especially true for standalone, utility-like modules.

### At least commit webdriver tests
While unit tests have been sparse, new webdriver tests should be written when reasonable or when fixing a bug around core functionality. The idea is not to have 100% coverage of all cases using the webdriver tests, but for all critical paths and major features to be tested. All webdriver tests are located in the spot-webdriver directory.

### Global CSS over CSS modules
It was found to be easier to support styling of views and components across different display widths when CSS was gathered in a more central location. Debugging was also easier due to the lack of class name generation done by modules. There was also the desire to separate styling from display logic, as Spot worked progressed with designs in a pending purgatory, and gathering styles in one location made auditing of all styles for redesigns to be easier.

### Design UI with varying width in mind
When implementing any UI, take into account different possible device widths. Device width is being used a loose way to support multiple resolutions. The devices on which a Spot-Remote may display varies, from 4K monitors to small smart phones. All UI testing should be tested at different width breakpoints. Generally it's been okay to hard code CSS, such as padding, as long as it looks okay across widths.

### Log as much as needed but keep it non-identifiable information
There are lots of logger statements sprinkled throughout the app. These logs can be recorded into a third-party. This type of logging has been found to be helpful to debug what the app was doing when it got into some kind of problem scenario and there is no physical access to the device which has the problem or the problem occurred some time ago. Over logging of events is fine. However, logs should not contain any personal or identifiable information, other than the random device-id that's generated to differentiate log sources. 

### Remember to log analytics for user actions
Be liberal with debug logging but judicious with analytics. Send analytics events for all major UI interactions taken by the user.

### Redux kept simple
Redux is an app-state manager that has pub-sub abilities for when app-state changes. It should contain state that is to be used across different parts of the app or used for caching while navigating across the app. Only when sharing state is necessary does state go into redux. If state can remain local, keep it local. Redux state should be as simple as reasonable, keeping business logic elsewhere. Here is an overview of state management in Spot (warning: the details may be outdated when this doc is read but the ideas may still be valid): https://sketchboard.me/TBtKyRmHyTFY#/
