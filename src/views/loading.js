import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { loadComplete } from 'actions';
import { google } from 'calendars';

import View from './view';

export class LoadingView extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object
    };

    componentDidMount() {
        if (google.isAuthenticated()) {
            setTimeout(() => {
                this.props.dispatch(loadComplete())
                this.props.history.push('/');
            }, 2000);
        } else {
            setTimeout(() => {
                this.props.dispatch(loadComplete())
                this.props.history.push('/setup');
            }, 2000);
        }
    }

    render() {
        return (
            <View>
                <div>Loading</div>
            </View>
        );
    }
}

export default connect()(LoadingView);
