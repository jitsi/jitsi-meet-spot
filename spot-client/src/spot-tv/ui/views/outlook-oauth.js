import React from 'react';

/**
 * Landing page for client-side Microsoft Outlook oauth redirects to pass back
 * any auth tokens to the main Spot-TV window.
 *
 * @extends React.Component
 */
export class OutlookOauth extends React.Component {
    /**
     * Attempts to emit the full url of the oauth landing to the Spot-TV window
     * so it may process the params.
     *
     * @inheritdoc
     */
    componentDidMount() {
        window.opener && window.opener.postMessage({
            type: 'ms-login',
            url: window.location.href
        }, window.location.origin);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'outlook-oauth-landing' />
        );
    }
}

export default OutlookOauth;
