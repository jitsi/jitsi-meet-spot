import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import styles from '../remote-control-menu.css';

export default class AudioMuteButton extends React.Component {
    static propTypes = {
        isMuted: PropTypes.bool,
        onClick: PropTypes.func
    };

    render() {
        const { isMuted } = this.props;

        return (
            <div
                className = { styles.selection }
                onClick = { this.props.onClick }>
                <Button className = { styles.button }>
                    <div className = { isMuted
                        ? 'icon-mic-disabled'
                        : 'icon-microphone' } />
                </Button>
                <span>{ isMuted ? 'Mic Unmute' : 'Mic Mute' }</span>
            </div>
        );
    }
}
