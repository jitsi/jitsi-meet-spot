import type { RootState } from 'common/app-state';
import { getDisplayName, setSpotTVState } from 'common/app-state';
import { View } from 'common/ui';
import React from 'react';
import { connect } from 'react-redux';

interface IProps {
    children?: any;
    name?: string;
    remoteControlServer?: any;
    spotRoomName?: string;
    updateSpotTvState: (newState: any) => void;
}

/**
 * A React Component representing a single screen in Spot-TV. Wraps {@code View}
 * to include notifying this component's parent of the current displayed view.
 *
 */
class SpotView extends React.Component<IProps> {
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
    componentDidUpdate(prevProps: IProps) {
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
        const { children, remoteControlServer } = this.props;
        const childComponents = React.Children.map(children, (child: any) =>
            React.cloneElement(
                child,
                { remoteControlServer }
            ));

        return (
            <View { ...this.props }>
                { childComponents }
            </View>
        );
    }

    /**
     * Helper for notification this component's parent of the currently
     * displayed view name.
     *
     * @param name - The name of the current view.
     * @private
     * @returns {void}
     */
    _updateCurrentViewStatus(name?: string) {
        this.props.updateSpotTvState({ view: name });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code SpotView}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        spotRoomName: getDisplayName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        updateSpotTvState(newState: any) {
            dispatch(setSpotTVState(newState));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotView);
