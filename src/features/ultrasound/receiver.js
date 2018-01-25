/* globals Quiet */

import React from 'react';
import { debounce } from 'lodash';

import config from 'config';
import { windowHandler } from 'utils';

const meetingDomain = config.get('meetingDomain');
const ultrasoundFilesDirectory = config.get('ultrasoundFilesDirectory');

export default class Receiver extends React.Component {
    state = {
        showRetry: false
    };

    constructor(props) {
        super(props);

        this._processTextContent = debounce(this._processTextContent, 1000);
        this._onReceive = this._onReceive.bind(this);
        this._onReceiverCreateFail = this._onReceiverCreateFail.bind(this);
        this._resetCachedContent = this._resetCachedContent.bind(this);

        this._rawContent = new ArrayBuffer(0);
        this._textContent = '';
    }

    componentDidMount() {
        Quiet.init({
            profilesPrefix: ultrasoundFilesDirectory,
            memoryInitializerPrefix: ultrasoundFilesDirectory,
            libfecPrefix: ultrasoundFilesDirectory
        });

        Quiet.addReadyCallback(
            () => {
                this._receiver = Quiet.receiver({
                    profile: 'ultrasonic',
                    onReceive: this._onReceive,
                    onCreateFail: this._onReceiverCreateFail,
                    onReceiveFail: this._resetCachedContent
                });
            },
            () => {
                this.setState({ showRetry: true });
            }
        );
    }

    componentWillUnmount() {
        if (this._receiver) {
            this._receiver.destroy();
        }
    }

    render() {
        return (
            <div>
                Listening...
            </div>
        );
    }

    _onReceive(recvPayload) {
        this._rawContent = Quiet.mergeab(this._rawContent, recvPayload);
        this._textContent = Quiet.ab2str(this._rawContent);
        this._processTextContent();
    }

    _onReceiverCreateFail() {
        // TODO: add receive failure handling...maybe adding retry button
    }

    _processTextContent() {
        let isValid = false;

        try {
            const url = new URL(this._textContent);
            const hashParts = url.hash.split('/');
            const jid = decodeURIComponent(url.hash.split('/')[2]);
            const bareJid = jid.split('/')[0];
            const resource = jid.split('/')[1];

            isValid = url.host === windowHandler.getCurrentHost()
                && hashParts[1] === 'remote-control'
                && bareJid.includes(meetingDomain)
                && Boolean(resource);
        } catch (e) {
            // TODO add some kind of error handling
        }
        if (isValid) {
            window.location = this._textContent;
        }

        this._resetCachedContent();
    }

    _resetCachedContent() {
        this._rawContent = new ArrayBuffer(0);
        this._textContent = '';
    }
}
