import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getClientId, getCalendarName } from 'reducers';

import styles from './admin.css';

export class CalendarStatus extends React.Component {
    static propTypes = {
        _calendarName: PropTypes.string,
        _clientId: PropTypes.string
    };

    render() {
        const { _calendarName, _clientId } = this.props;

        return (
            <div className = { styles.container }>
                <div className = { styles.title }>
                    Calendar Status
                </div>
                <div className = { styles.content }>
                    <div className = { styles.detail }>
                        calendar: { _calendarName }
                    </div>
                    <div className = { styles.detail }>
                        app client: { _clientId }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        _calendarName: getCalendarName(state),
        _clientId: getClientId(state)
    };
}

export default connect(mapStateToProps)(CalendarStatus);
