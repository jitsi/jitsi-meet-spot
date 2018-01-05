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
        // FIXME: move into action
        google.getRooms()
            .then(rooms => {
                this.setState({
                    loading: false,
                    rooms
                });
            });
    }

    render() {
        if (this.state.loading) {
            return <div><LoadingIcon /></div>;
        }

        const rooms = this.state.rooms.map(room =>
            <button
                key = { room.etags }
                onClick = { () => this._onRoomClick(room) }>
                { room.resourceName }
            </button>
        );

        return (
            <div>
                { rooms }
            </div>
        );
    }

    _onRoomClick(room) {
        this.props.dispatch(setCalendar(room.resourceEmail));
        this.props.onSuccess();
    }
}

export default connect()(GoogleSelectRoom);
