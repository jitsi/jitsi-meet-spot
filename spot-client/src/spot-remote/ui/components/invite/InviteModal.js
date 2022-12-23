import { Modal } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';


/**
 * Displays a people search for inviting to a meeting.
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
