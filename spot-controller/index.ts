import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the Expo environment for both `expo run:*` (dev client) and stores.
registerRootComponent(App);
