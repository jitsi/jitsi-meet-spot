import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getOptimisticTileViewState,
    isTileViewChangePending,
    setTileView
} from 'common/app-state';
import { GridOff, GridOn } from 'common/icons';

import NavButton from './../nav-button';

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @extends React.Component
 */
export class TileViewButton extends React.Component {
    static propTypes = {
        changePending: PropTypes.bool,
        setTileView: PropTypes.func,
        tileView: PropTypes.bool
    };

    /**
     * Initializes a new {@code TileViewButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleTileView = this._onToggleTileView.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { tileView } = this.props;
        const label = tileView ? 'Exit Tile View' : 'Enter Tile View';
        const qaId = tileView ? 'exit-tile-view' : 'enter-tile-view';

        return (
            <NavButton
                label = { label }
                onClick = { this._onToggleTileView }
                qaId = { qaId }>
                { tileView ? <GridOff /> : <GridOn /> }
            </NavButton>
        );
    }

    /**
     * Changes the current local audio mute state of a Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onToggleTileView() {
        if (this.props.changePending) {
            return;
        }

        this.props.setTileView(!this.props.tileView);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code TileViewButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const optimisticTileViewState = getOptimisticTileViewState(state);

    return {
        tileView: typeof optimisticTileViewState === 'undefined'
            ? getInMeetingStatus(state).tileView : optimisticTileViewState,
        changePending: isTileViewChangePending(state)
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
        setTileView(tileView) {
            dispatch(setTileView(tileView));
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(TileViewButton);
