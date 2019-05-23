import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCurrentModal } from 'common/app-state';

/**
 * Displays a modal component stored in Redux.
 *
 * @extends React.PureComponent
 */
export class ModalManager extends React.PureComponent {
    static defaultProps = {
        modalProps: {}
    };

    static propTypes = {
        modal: PropTypes.func,
        modalProps: PropTypes.object
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        if (!this.props.modal) {
            return null;
        }

        const Modal = this.props.modal;

        return <Modal { ...this.props.modalProps } />;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ModalManager}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getCurrentModal(state)
    };
}

export default connect(mapStateToProps)(ModalManager);
