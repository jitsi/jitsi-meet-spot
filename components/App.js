import React from 'react';
import Layout from './Layout';
import JitsiMeetIframe from './JitsiMeetIframe';

/**
 * Root application component.
 */
class App extends React.Component {
    /**
     * Renders component.
     * 
     * @returns {void}
     */
    render() {
        return (
            <div>
                <Layout />
                <JitsiMeetIframe />
            </div>
        );
    }
}

export default App;
