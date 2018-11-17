import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import styles from './setup.css';

export default function Welcome({ onSuccess }) {
    return (
        <div className = { styles.step }>
            <h2 className = { styles.title }>
                Welcome To Spot
            </h2>
            <div className = { styles.content } />
            <div className = { styles.buttons}>
                <Button onClick = { onSuccess }>
                    Next
                </Button>
            </div>
        </div>
    );
}

Welcome.propTypes = {
    onSuccess: PropTypes.func.isRequired
};
