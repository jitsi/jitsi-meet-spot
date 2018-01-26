/* globals Quiet */

import React from 'react';
import { debounce } from 'lodash';

import config from 'config';
import { logger, windowHandler } from 'utils';

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

            isValid = url.host === windowHandler.getCurrentHost()
                && hashParts[1] === 'remote-control'
                && this._isValidJid(jid);
        } catch (e) {
            logger.error(e);
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

    /* eslint-disable max-len */
    // An example valid format is:
    // ABCDEFGH-ABCD-ABCD-ABCD-ABCDEFGHIJKL@lenny.jitsi.net/OPQRSTUV-OPQR-OPQR-OPQR-OPQRSTUVWXYZ
    /* eslint-enable max-len */
    _isValidJid(jid) {
        const uuidPartsLengths = [ 8, 4, 4, 4, 12 ];

        // First process the bare jid's uuid:
        // ABCDEFGH-ABCD-ABCD-ABCD-ABCDEFGHIJKL@lenny.jitsi.net
        const bareJid = jid.split('/')[0];

        if (!bareJid.includes(meetingDomain)) {
            return false;
        }

        const splitBareJid = bareJid.split('@');
        const uuid = splitBareJid[0];
        const uuidParts = uuid.split('-');

        if (uuidParts.length !== uuidPartsLengths.length) {
            return false;
        }

        for (let i = 0; i < uuidParts.length; i++) {
            if (uuidParts[i].length !== uuidPartsLengths[i]) {
                return false;
            }
        }

        // Then process the resource:
        // OPQRSTUV-OPQR-OPQR-OPQR-OPQRSTUVWXYZ
        const resource = jid.split('/')[1];
        const resourceParts = resource.split('-');

        if (resourceParts.length !== uuidPartsLengths.length) {
            return false;
        }

        for (let i = 0; i < resourceParts.length; i++) {
            if (resourceParts[i].length !== uuidPartsLengths[i]) {
                return false;
            }
        }

        return true;
    }
}
