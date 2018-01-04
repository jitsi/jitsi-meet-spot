import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendar } from 'actions';
import { google } from 'calendars';

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
        // FIXME: move into action
        google.getRooms()
            .then(rooms => {
                this.setState({ rooms });
            });
    }

    render() {
        const rooms = this.state.rooms.map(room => {
            return (
                <button
                    key = { room.etags }
                    onClick = { () => this._onRoomClick(room) }>
                    { room.resourceName }
                </button>
            )
        });

        return (
            <div>
                { rooms }
            </div>
        );
    }

    _onRoomClick(room) {
        this.props.dispatch(setCalendar(room.resourceEmail, []));
        this.props.onSuccess();
    }
}

export default connect()(GoogleSelectRoom);
