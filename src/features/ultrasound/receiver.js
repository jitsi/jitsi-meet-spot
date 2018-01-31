/* globals Quiet */

import React from 'react';
import { debounce } from 'lodash';
import { Strophe } from 'strophe.js';

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

    _isValidJid(jid) {
        const node = Strophe.getNodeFromJid(jid);
        const domain = Strophe.getDomainFromJid(jid);
        const resource = Strophe.getResourceFromJid(jid);

        // TODO: Implement better validity checking... As a quick check way to
        // implement jid validity, it is assumed nodes and resources always have
        // a length of 36 characters. However, 36 is not a standard and is just
        // an assumption that the jids used for spot have 36 characters.
        return Boolean(node
            && node.length === 36
            && domain
            && domain === meetingDomain
            && resource
            && resource.length === 36);
    }
}
