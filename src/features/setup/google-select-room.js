import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendar } from 'actions';
import { google } from 'calendars';
import { Button } from 'features/button';
import { LoadingIcon } from 'features/loading-icon';

import styles from './setup.css';

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

        let content;
        let continueButton = null;

        if (loading) {
            content = <LoadingIcon />;
        } else if (rooms.length) {
            content = rooms.map(room =>
                <div key = { room.etags }>
                    <Button onClick = { () => this._onRoomClick(room) }>
                        { room.resourceName }
                    </Button>
                </div>
            );
        } else {
            content = rooms.map(room =>
                <div>
                    <Button
                        key = { room.etags }
                        onClick = { () => this._onRoomClick(room) }>
                        { room.resourceName }
                    </Button>
                </div>
            );
        }

        return (
            <div className = { styles.step }>
                <div className = { styles.title }>
                    Select A Room
                </div>
                <div className = { styles.content }>
                    { content }
                </div>
                <div className = { styles.buttons }>
                    { continueButton }
                </div>
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
