# Style guide

This is the style-guideline for the sub-repo spot-client. However the style of the characters of the code and formatting isn't really enforced...although the jitsi-meet linting rules are re-used. This documents is aimed to help understand the design choices made in implementing spot-client, ie the style of the architecture.

### Add documentation to prevent tribal knowledge
As the spot repo grew, little quirks became little, obscure quirks. Add documentation when it seems necessary to make sure future developers can understand a feature. Also, do not be afraid to completely delete documentation.

### Commit tests eventually
In its defense, the philosophy is not "avoid  tests." Spot started with no set product spec and continues to operate without one while facing strict deadlines As a result it's possible the product can change rapidly and features torn down without time to rebuild. As a result, committing tests has generally been avoided until there's some settling down with the feature and code-implementation. Once an implementation is known, tests should be committed. This should be especially true for standalone, utility like modules.

### Global CSS over css modules
It was found to be easier to support styling of views and components across different widths when CSS was gathered in a more central location. Debugging was also easier due to the lack of class name generation done by modules. There was also the desire to separate styling from display logic, as spot worked progressed with designs in a pending purgatory, and gathering styles in one location made auditing of all styles for redesigns to be easier.

### Design UI with variable width in mind
When implementing any UI, take into account different possible device widths. Device width is being used a loose way to support multiple resolutions. The devices on which a spot remote may display varies, from 4K monitors to small smart phones. All UI testing should be tested at different width breakpoints. Generally it's been okay to hard-code CSS as long as it looks okay across widths.

### Log as much as needed but keep it non-identifiable information
There are lots of logger statements sprinkled throughout the app. These logs can be recorded into a third-party. This type of logging has been found to be helpful to debug what the app was doing when it got into some kind of problem scenario and there is no physical access to the device which has the problem or the problem occurred some time ago. Over logging of events is fine. However, logs should not contain any personal or identifiable information, other than the random device-id that's generated to differentiate log sources. 

### Redux kept simple
Redux is an app-state manager that has pub-sub abilities for when app-state changes. It should contain state that is to be used across different parts of the app or used for caching while navigating across the app. Only when sharing state is necessary does it go into redux. If state can remain local, keep it local. It should be as simple as reasonable, keeping business logic elsewhere. Here is an overview of state management in spot (warning: the details may be outdated when this doc is read but the ideas may still be valid): https://sketchboard.me/TBtKyRmHyTFY#/
