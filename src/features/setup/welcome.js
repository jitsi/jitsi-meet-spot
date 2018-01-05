import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import styles from './setup.css';

export class Welcome extends React.Component {
    static propTypes = {
        onSuccess: PropTypes.func
    };

    render() {
        return (
            <div className = { styles.step }>
                <h2 className = { styles.title }>
                    Welcome To Spot
                </h2>
                <div className = { styles.content } />
                <div className = { styles.buttons}>
                    <Button onClick = { this.props.onSuccess }>
                        Next
                    </Button>
                </div>
            </div>
        );
    }
}

export default Welcome;
