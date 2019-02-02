import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { JoinInfo } from 'features/join-info';
import { getBackgroundUrl } from 'reducers';
import { remoteControlService } from 'remote-control';

/**
 * A React Component representing a single screen in the single-page application
 * and is responsible for basic layout.
 *
 * @extends React.Component
 */
class View extends React.Component {
    static propTypes = {
        backgroundUrl: PropTypes.string,
        children: PropTypes.node,
        hideBackground: PropTypes.bool,
        name: PropTypes.string
    };

    /**
     * Updates the {@code remoteControlService} with the currently displayed
     * viewed name.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.name) {
            remoteControlService.notifyViewStatus(this.props.name);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        let backgroundStyles;

        if (!this.props.hideBackground) {
            const backgroundUrl = this.props.backgroundUrl;

            if (backgroundUrl) {
                backgroundStyles = {
                    backgroundImage: `url('${backgroundUrl}')`
                };
            }
        }

        return (
            <div
                className = 'view'
                data-qa-id = { `${this.props.name}-view` }
                style = { backgroundStyles }>
                { this.props.children }
                <JoinInfo />
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code View}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        backgroundUrl: getBackgroundUrl(state)
    };
}

export default connect(mapStateToProps)(View);
