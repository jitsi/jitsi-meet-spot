import type { RootState } from 'common/app-state';
import {
    hideModal,
    isVolumeControlSupported
} from 'common/app-state';
import { VolumeUp } from 'common/icons';
import { Modal } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { DTMFButton, DTMFModal } from './../dtmf';
import { NavButton } from './../nav';
import { TileViewButton } from './../remote-control-menu';
import VolumeModal from './VolumeModal';

/**
 * The type of the props of {@link MoreModal}.
 */
interface IProps {

    /**
     * Stop showing the {@code MoreModal}.
     */
    onClose?: () => void;

    /**
     * Whether or not DTMF tones are supported.
     */
    supportsDtmf?: boolean;

    /**
     * Whether or not volume control is supported.
     */
    supportsVolumeControl?: boolean;

    /**
     * The i18n translation function.
     */
    t?: (key: string) => string;
}

/**
 * The type of the state of {@link MoreModal}.
 */
interface IState {

    /**
     * The modal that should currently be displayed.
     */
    modalToDisplay: string;
}

/**
 * Implements a modal to show some more buttons that are probably less often used as the main ones on the screen.
 */
export class MoreModal extends React.Component<IProps, IState> {

    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            modalToDisplay: 'more'
        };

        this._onShowMoreMenu = this._onShowMoreMenu.bind(this);
        this._onShowDtmfModal = this._onShowDtmfModal.bind(this);
        this._onShowVolumeMenu = this._onShowVolumeMenu.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        switch (this.state.modalToDisplay) {
        case 'volume':
            return <VolumeModal onClose = { this._onShowMoreMenu } />;
        case 'dtmf':
            return <DTMFModal onClose = { this._onShowMoreMenu } />;
        }

        return (
            <Modal
                onClose = { this.props.onClose }
                qaId = 'more-modal'>
                <div className = 'more-modal'>
                    <TileViewButton />
                    <DTMFButton onClick = { this._onShowDtmfModal } />
                    {
                        this.props.supportsVolumeControl && (
                            <NavButton
                                label = { this.props.t?.('commands.volume') }
                                onClick = { this._onShowVolumeMenu }
                                qaId = 'volume'>
                                <VolumeUp />
                            </NavButton>
                        )
                    }
                </div>
            </Modal>
        );
    }

    /**
     * Displays the DTMF modal.
     *
     * @returns {void}
     */
    _onShowDtmfModal() {
        this.setState({ modalToDisplay: 'dtmf' });
    }

    /**
     * Displays the default modal state, which has buttons to all features
     * within {@code MoreModal}.
     *
     * @returns {void}
     */
    _onShowMoreMenu() {
        this.setState({ modalToDisplay: 'more' });
    }

    /**
     * Displays the volume modal.
     *
     * @returns {void}
     */
    _onShowVolumeMenu() {
        this.setState({ modalToDisplay: 'volume' });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code MoreModal}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        supportsVolumeControl: isVolumeControlSupported(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Stop showing the {@code MoreModal}.
         *
         * @returns {void}
         */
        onClose() {
            dispatch(hideModal());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(MoreModal)
);
