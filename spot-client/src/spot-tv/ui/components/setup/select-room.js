import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { setCalendar, setDisplayName } from 'common/app-state';
import { logger } from 'common/logger';
import { Button, Input } from 'common/ui';

import { calendarService } from './../../../calendars';

/**
 * Prompts to select which calender to synchronize with Spot. Either a room can
 * be selected or a calendar email manually entered.
 *
 * @extends React.Component
 */
export class SelectRoom extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code SelectRoom} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            rooms: []
        };

        this._fetchRooms = this._fetchRooms.bind(this);
        this._debouncedFetchRooms = debounce(this._fetchRooms, 250);

        this._onEmailChange = this._onEmailChange.bind(this);
        this._onEmailSubmit = this._onEmailSubmit.bind(this);
        this._onRoomClick = this._onRoomClick.bind(this);
    }

    /**
     * Requests a list of rooms that may be connected to Spot.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._fetchRooms();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const content = this.state.rooms.map((room, index) => (
            <div
                className = 'room-selection'
                key = { index }

                // eslint-disable-next-line react/jsx-no-bind
                onClick = { () => this._onRoomClick(room) }
                tabIndex = { 0 }>
                { room.resourceName }
            </div>
        ));

        if (this.state.email) {
            content.push(
                <div
                    className = 'room-selection'
                    key = 'entered-value'

                    // eslint-disable-next-line react/jsx-no-bind
                    onClick = { () => this._onEmailSubmit(this.state.email) }
                    tabIndex = { 0 }>
                    { this.props.t('setup.useEmail')} {this.state.email}
                </div>
            );
        }

        return (
            <div className = 'spot-setup setup-step setup-roomList'>
                <div className = 'setup-title'>
                    { this.props.t('setup.roomSelect') }
                </div>
                <div className = 'setup-content'>
                    <div>
                        <h1>{ this.props.t('setup.roomByEmail') }</h1>
                        <form onSubmit = { this._onEmailSubmit }>
                            <Input
                                onChange = { this._onEmailChange }
                                placeholder = { this.props.t('setup.enterName') }
                                value = { this.state.email } />
                        </form>
                    </div>
                    <div className = 'room-list'>
                        { content }
                    </div>
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this.props.onSuccess }>
                        { this.props.t('buttons.skip') }
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Queries the calendar service for room calendars.
     *
     * @private
     * @returns {Promise<void>}
     */
    _fetchRooms() {
        return calendarService.getRooms(this.state.email)
            .then(rooms => {
                logger.log(
                    'fetched list of rooms', { count: rooms.length });

                this.setState({ rooms });
            })
            .catch(error => {
                logger.error('could not fetch list of rooms', { error });

                this.setState({ rooms: [] });
            });
    }

    /**
     * Updates the known manually entered email for which Spot-TV should connect
     * with.
     *
     * @param {Event} event - The change event for updating the entered email.
     * @private
     * @returns {void}
     */
    _onEmailChange(event) {
        this.setState({
            email: event.target.value,
            rooms: this.state.rooms.filter(
                room => room.resourceName.startsWith(event.target.value))
        }, () => this._debouncedFetchRooms());
    }

    /**
     * Sets the email from which calendar events should be fetched by Spot-TV
     * and ends this setup step.
     *
     * @returns {void}
     */
    _onEmailSubmit() {
        logger.log('selectRoom email submitted');

        this.props.dispatch(setCalendar(
            this.state.email,
            '',
            calendarService.getType()
        ));

        this.props.dispatch(setDisplayName(''));

        this.props.onSuccess();
    }

    /**
     * Sets the room from which calendar events should be fetched by Spot-TV and
     * ends this setup step.
     *
     * @param {Object} room - The room to be used for calendar integration.
     * @returns {void}
     */
    _onRoomClick(room) {
        logger.log('selectRoom room selected');

        this.props.dispatch(setCalendar(
            room.resourceEmail,
            room.resourceName,
            calendarService.getType()
        ));

        this.props.dispatch(setDisplayName(room.resourceName));

        this.props.onSuccess();
    }
}

export default connect()(withTranslation()(SelectRoom));
