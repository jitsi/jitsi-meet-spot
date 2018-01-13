import React from 'react';

import { Button } from 'features/button';
import { Input } from 'features/input';
import { remoteControlService } from 'remote-control';
import { persistence } from 'utils';

import View from './view';
import styles from './view.css';

export default class RemoteControlDebug extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            jid: persistence.get('debug-jid')
        };

        this._hangUp = this._hangUp.bind(this);
        this._onJidChange = this._onJidChange.bind(this);
        this._toggleMute = this._toggleMute.bind(this);
    }

    render() {
        return (
            <View>
                <div className = { styles.container }>
                    <div>
                        <Input
                            onChange = { this._onJidChange }
                            value = { this.state.jid } />
                    </div>
                    <div>
                        <Button onClick = { this._toggleMute }>
                            Toggle Mute
                        </Button>
                        <Button onClick = { this._hangUp }>
                            Hangup
                        </Button>
                    </div>
                </div>
            </View>
        );
    }

    _onJidChange(event) {
        this.setState({ jid: event.target.value });
    }

    _hangUp() {
        remoteControlService.sendCommand(this.state.jid, 'hangup');
    }

    _toggleMute() {
        remoteControlService.sendCommand(this.state.jid, 'toggleAudio');
    }
}
