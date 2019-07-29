import PropTypes from 'prop-types';
import React from 'react';
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { connect } from 'react-redux';

import cast from '../../../assets/icons/cast.svg';

import api from '../../api';
import { Icon } from '../../icons';
import { logger } from '../../logger';

import { resetBeaconNotificationFlag } from '../actions';

import styles from './styles';

/**
 * An overlay that shows up over the webview when there is a spot beacon detected, and
 * lets the user pick a detected spot TV and join that with a touch.
 *
 * @extends React.Component
 */
class BeaconOverlay extends React.PureComponent {
    static propTypes = {
        beacons: PropTypes.array,
        dispatch: PropTypes.func,
        joinReady: PropTypes.bool,
        notificationReceived: PropTypes.bool
    };

    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            pickerVisible: false
        };

        this._keyExtractor = this._keyExtractor.bind(this);
        this._onTogglePicker = this._onTogglePicker.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }

    /**
     * Implements {@code Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.notificationReceived && this.props.notificationReceived) {
            logger.info('Rendering the overlay from a notification tap.');
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                pickerVisible: true
            });
            this.props.dispatch(resetBeaconNotificationFlag());
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { beacons, joinReady } = this.props;

        if (!joinReady || !beacons.length) {
            return null;
        }

        return (
            <View style = { styles.beaconOverlay }>
                <TouchableOpacity onPress = { this._onTogglePicker }>
                    <Icon src = { cast } />
                </TouchableOpacity>
                <Modal
                    style = { styles.modal }
                    transparent = { true }
                    visible = { this.state.pickerVisible } >
                    <TouchableWithoutFeedback onPress = { this._onTogglePicker }>
                        <View style = { styles.backdrop } />
                    </TouchableWithoutFeedback>
                    <View style = { styles.itemContainer }>
                        <Text style = { styles.pickerHeader }>Nearby devices</Text>
                        <FlatList
                            data = { beacons }
                            keyExtractor = { this._keyExtractor }
                            renderItem = { this._renderItem } />
                    </View>
                </Modal>
            </View>
        );
    }

    /**
     * Generates unique keys for a flatlist item.
     *
     * @param {Object} item - A beacon instance.
     * @returns {string}
     */
    _keyExtractor(item) {
        return `${item.joinCode}-${item.proximity}`;
    }

    /**
     * Callback to be invoked for the onPress event of the button and the backdrop.
     *
     * @returns {void}
     */
    _onTogglePicker() {
        this.setState({
            pickerVisible: !this.state.pickerVisible
        });
    }

    /**
     * Callback to be invoked on join code selection.
     *
     * @param {string} joinCode - The selected join code.
     * @returns {Function}
     */
    _onSelectJoinCode(joinCode) {
        return () => {
            api.enterJoinCode(joinCode);
            this.setState({
                pickerVisible: false
            });
        };
    }

    /**
     * Renders a single item.
     *
     * @param {Object} flatListItem - The item to render.
     * @returns {React$Component}
     */
    _renderItem({ item }) {
        return (
            <TouchableOpacity
                onPress = { this._onSelectJoinCode(item.joinCode) }
                style = { styles.pickerItem }>
                <Text style = { styles.pickerItemLabel }> { item.joinCode } </Text>
            </TouchableOpacity>
        );
    }
}

/**
 * Maps part of the Redux store to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *     beacons: Array<Object>,
 *     joinReady: boolean,
 *     notificationReceived: boolean
 * }}
 */
function _mapStateToProps(state) {
    const { beacons, joinReady, notificationReceived } = state.beacons;

    return {
        beacons,
        joinReady,
        notificationReceived
    };
}

export default connect(_mapStateToProps)(BeaconOverlay);
