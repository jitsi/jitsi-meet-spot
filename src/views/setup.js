import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Setup } from 'features/setup';

import View from './view';
import styles from './view.css';

export class SetupView extends React.Component {
    static propTypes = {
        history: PropTypes.object
    };

    constructor(props) {
        super(props);

        this._redirectToCalendar = this._redirectToCalendar.bind(this);
    }

    render() {
        return (
            <View>
                <div className = { styles.container }>
                    <Setup
                        onCancel = { this._redirectToCalendar }
                        onSuccess = { this._redirectToCalendar } />
                </div>
            </View>
        );
    }

    _redirectToCalendar() {
        this.props.history.push('/');
    }
}

export default connect()(SetupView);
