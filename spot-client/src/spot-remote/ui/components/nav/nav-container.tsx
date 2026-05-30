import React from 'react';

interface IProps {
    children?: any;
}

/**
 * A component intended for hold nav buttons. Useful for re-using styling.
 */
export default class NavContainer extends React.Component<IProps> {
    /**
     * Implements React's {@link SettingsMenu#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        return (
            <div className = 'nav-section'>
                <div className = 'nav'>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
