import PropTypes from 'prop-types';
import React from 'react';

import { Modal } from 'common/ui';

/**
 * Displays a people search for inviting to a meeting.
 *
 * @extends React.Component
 */
export class InviteModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Modal onClose = { this.props.onClose }>
                <div className = 'invite-modal'>
                    Invites
                </div>
            </Modal>
        );
    }

}

export default InviteModal;
