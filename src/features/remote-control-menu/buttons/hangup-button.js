import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

import styles from '../remote-control-menu.css';

export default function HangupButton({ onClick }) {
    return (
        <div
            className = { styles.selection }
            onClick = { onClick }>
            <Button className = { `${styles.hangup} ${styles.button}` }>
                <div className = 'icon-hangup' />
            </Button>
            <span>Hang up</span>
        </div>
    );
}

HangupButton.propTypes = {
    onClick: PropTypes.func.isRequired
};
