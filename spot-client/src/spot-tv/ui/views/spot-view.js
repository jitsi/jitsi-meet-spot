import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getDisplayName, setSpotTVState } from 'common/app-state';
import { ReconnectOverlay, View } from 'common/ui';

import { JoinInfo } from './../components';

/**
 * A React Component representing a single screen in Spot-TV. Wraps {@code View}
 * to include notifying this component's parent of the current displayed view.
 *
 * @extends React.Component
 */
class SpotView extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        name: PropTypes.string,
        remoteControlServer: PropTypes.object,
        spotRoomName: PropTypes.string,
        updateSpotTvState: PropTypes.func
    };

    /**
     * Invokes notification of the currently displayed view name.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._updateCurrentViewStatus(this.props.name);
    }

    /**
     * Invokes notification of the currently displayed view name.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.name !== this.props.name) {
            this._updateCurrentViewStatus(this.props.name);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { children, remoteControlServer, spotRoomName } = this.props;
        const childComponents = React.Children.map(children, child =>
            React.cloneElement(
                child,
                { remoteControlServer }
            ));

        return (
            <View { ...this.props }>
                { childComponents }
                <div className = 'info-footer'>
                    { spotRoomName && `${spotRoomName} | ` }
                    <JoinInfo showDomain = { true } />
                </div>
                <ReconnectOverlay />
            </View>
        );
    }

    /**
     * Helper for notification this component's parent of the currently
     * displayed view name.
     *
     * @param {string} name - The name of the current view.
     * @private
     * @returns {void}
     */
    _updateCurrentViewStatus(name) {
        this.props.updateSpotTvState({ view: name });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code SpotView}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        spotRoomName: getDisplayName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        updateSpotTvState(newState) {
            dispatch(setSpotTVState(newState));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotView);
