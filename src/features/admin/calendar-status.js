import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getClientId, getCalendarName } from 'reducers';

export class CalendarStatus extends React.Component {
    static propTypes = {
        _calendarName: PropTypes.string,
        _clientId: PropTypes.string
    };

    render() {
        const { _calendarName, _clientId } = this.props;

        return (
            <div>
                <div>Current calendar name: { _calendarName }</div>
                <div>Current client used: { _clientId }</div>
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
