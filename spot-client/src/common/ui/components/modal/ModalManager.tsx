import type { RootState } from 'common/app-state';
import { getCurrentModal } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';


/**
 * The props for {@code ModalManager}.
 */
interface IProps {

    /**
     * The modal component to render, or a falsy value to render nothing.
     */
    modal?: React.ComponentType<any> | null;

    /**
     * The props to pass into the modal component.
     */
    modalProps?: Record<string, any>;
}

/**
 * Displays a modal component stored in Redux.
 */
export class ModalManager extends React.PureComponent<IProps> {
    static defaultProps = {
        modalProps: {}
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
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        ...getCurrentModal(state)
    };
}

export default connect(mapStateToProps)(ModalManager);
