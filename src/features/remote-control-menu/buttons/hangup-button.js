import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

import styles from '../remote-control-menu.css';

export default class HangupButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func
    };

    render() {
        return (
            <div
                className = { styles.selection }
                onClick = { this.props.onClick }>
                <Button className = { `${styles.hangup} ${styles.button}` }>
                    <div className = 'icon-hangup' />
                </Button>
                <span>Hang up</span>
            </div>
        );
    }
}
