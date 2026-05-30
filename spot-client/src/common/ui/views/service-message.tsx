import React from 'react';

import View from './view';

/**
 * The props for {@link ServiceMessage}.
 */
interface IServiceMessageProps {
    message?: string;
}

/**
 * A component for displaying a message about a current operation in progress.
 * Used for displaying a message about a recoverable error as recovery is in
 * progress.
 */
export default class ServiceMessage extends React.Component<IServiceMessageProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        return (
            <View name = 'spot-tv-error'>
                <div className = 'container'>
                    <div className = 'admin'>
                        <div>
                            { this.props.message }
                        </div>
                    </div>
                </div>
            </View>
        );
    }
}
