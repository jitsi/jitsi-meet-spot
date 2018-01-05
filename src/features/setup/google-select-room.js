import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendar } from 'actions';
import { google } from 'calendars';
import { LoadingIcon } from 'features/loading-icon';

export class GoogleSelectRoom extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._onRoomClick = this._onRoomClick.bind(this);

        this.state = {
            rooms: [],
            loading: true
        };
    }

    componentDidMount() {
        this._fetchRooms();
    }

    render() {
        const { loading, rooms } = this.state;

        if (loading) {
            return <div><LoadingIcon /></div>;
        }

        if (!rooms.length) {
            return (
                <div>
                    No rooms found
                    <button onClick = { this.onSuccess }>Next</button>
                </div>
            );
        }

        const roomSelections = rooms.map(room =>
            <button
                key = { room.etags }
                onClick = { () => this._onRoomClick(room) }>
                { room.resourceName }
            </button>
        );

        return (
            <div>
                { roomSelections }
            </div>
        );
    }

    // FIXME: move into action
    _fetchRooms() {
        this.setState({ loading: true }, () =>
            google.getRooms()
                .then(rooms => {
                    this.setState({
                        loading: false,
                        rooms
                    });
                }));
    }

    _onRoomClick(room) {
        this.props.dispatch(setCalendar(room.resourceEmail));
        this.props.onSuccess();
    }
}

export default connect()(GoogleSelectRoom);
