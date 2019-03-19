import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendar, setDisplayName } from 'common/app-state';
import { logger } from 'common/logger';
import { Button, Input, LoadingIcon } from 'common/ui';

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
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code SelectRoom} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onEmailChange = this._onEmailChange.bind(this);
        this._onEmailSubmit = this._onEmailSubmit.bind(this);
        this._onRoomClick = this._onRoomClick.bind(this);

        this.state = {
            email: '',
            rooms: [],
            loading: true
        };
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
        const { loading, rooms } = this.state;

        let content;
        let continueButton = null;

        if (loading) {
            content = <LoadingIcon />;
        } else if (rooms.length) {
            content = rooms.map(room => (
                <div key = { room.resourceName }>
                    <Button

                        // eslint-disable-next-line react/jsx-no-bind
                        onClick = { () => this._onRoomClick(room) }>
                        { room.resourceName }
                    </Button>
                </div>
            ));
        } else {
            content = <div>No rooms</div>;

            continueButton
                = <Button onClick = { this.props.onSuccess }>Continue</Button>;
        }

        return (
            <div className = 'setup-step setup-roomList'>
                <div className = 'setup-title'>
                    Select A Room
                </div>
                <div className = 'setup-content'>
                    <div>
                        <h1>Enter an email:</h1>
                        <form onSubmit = { this._onEmailSubmit }>
                            <Input
                                onChange = { this._onEmailChange }
                                placeholder = 'Enter an email'
                                value = { this.state.email } />
                            <Button type = 'submit'>Go</Button>
                        </form>
                    </div>
                    <div>
                        <h1>Or select a rooms:</h1>
                        <div>
                            { content }
                        </div>
                    </div>
                </div>
                <div className = 'setup-buttons'>
                    { continueButton }
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
        return calendarService.getRooms()
            .then(rooms => {
                logger.log(
                    `selectRoom got room list of ${rooms.length}`);

                this.setState({
                    loading: false,
                    rooms
                });
            })
            .catch(error => {
                logger.error(
                    `selectRoom could not fetch rooms ${error}`);

                this.setState({
                    loading: false,
                    rooms: []
                });
            });
    }

    /**
     * Updates the known manually entered email for which to connect with Spot.
     *
     * @param {Event} event - The change event for updating the entered email.
     * @private
     * @returns {void}
     */
    _onEmailChange(event) {
        this.setState({
            email: event.target.value
        });
    }

    /**
     * Sets the email from which calendar events should be fetched by Spot and
     * ends this setup step.
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
     * Sets the room from which calendar events should be fetched by Spot and
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

export default connect()(SelectRoom);
