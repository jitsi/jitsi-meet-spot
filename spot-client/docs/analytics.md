# Analytics

Spot has support for reporting select UI events to the Segment analytics service. Segment can then pass those events on to other analytics services. These events differ from logging in that they focus specifically on user initiated actions to track usage paths, whereas logging attempts to capture as much non-personal information as possible for debugging.

To enable analytics, set the ANALYTICS_APP_KEY within config.js or, in dev environments, set an environment variable for ANALYTICS_APP_KEY.
