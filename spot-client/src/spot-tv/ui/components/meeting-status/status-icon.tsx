import React from 'react';

interface IProps {
    children?: any;
    qaId?: string;
}

/**
 * Wraps an icon for displaying the status of a Spot-TV state.
 */
export default class StatusIcon extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div
                className = { `status-icon ${this.props.qaId}` }
                data-qa-id = { this.props.qaId }>
                { this.props.children }
            </div>
        );
    }
}
