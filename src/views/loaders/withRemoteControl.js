import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setLocalRemoteControlID } from 'actions';
import {
    remoteControlService,
    RemoteControlWindowService
} from 'remote-control';
import { logger, windowHandler } from 'utils';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class RemoteControlLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        dispatch: PropTypes.func
    };

    /**
     *
     * @param {*} props
     */
    constructor(props) {
        super(props);

        this._generateUrl = this._generateUrl.bind(this);
        this._remoteControlWindowService = new RemoteControlWindowService({
            urlGenerator: this._generateUrl
        });
    }

    /**
     *
     * @param {*} targetId
     */
    _generateUrl(targetId) {
        return `${windowHandler.getBaseUrl()}#/remote-control/${
            window.encodeURIComponent(targetId)}`;
    }

    /**
     * Returns the name of the muc to join. The name is taken from the query
     * params, if set, or taken from the jid created by the remote control
     * service during initialization.
     *
     * @private
     * @returns {string}
     */
    _getMucName() {
        const remoteIdParam = this.props.match
            && this.props.match.params
            && this.props.match.params.remoteId;
        const remoteId = remoteIdParam && decodeURIComponent(remoteIdParam);

        return remoteId
            ? remoteId.split('@')[0]
            : remoteControlService.getNode();
    }

    /**
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlService,
            remoteControlWindowService: this._remoteControlWindowService
        };
    }

    /**
     * @override
     */
    _loadService() {
        return remoteControlService.init()
            .then(jid => this.props.dispatch(setLocalRemoteControlID(jid)))
            .then(() =>
                remoteControlService.createMuc(this._getMucName()))
            .then(() => remoteControlService.joinMuc())
            .catch(error => logger.error(error));
    }
}

const ConnectedRemoteControlLoader = withRouter(connect()(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
