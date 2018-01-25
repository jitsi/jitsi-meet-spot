import React from 'react';

import { Receiver } from 'features/ultrasound';

import View from './view';
import styles from './view.css';

export default class RemoteControlListener extends React.Component {
    render() {
        return (
            <View name = 'admin'>
                <div className = { styles.container }>
                    <Receiver />
                </div>
            </View>
        );
    }
}
