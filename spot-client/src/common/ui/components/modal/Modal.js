import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a modal dialog in the middle of the screen, above other UI elemnts.
 *
 * @extends React.Component
 */
export default class Modal extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        onClose: PropTypes.func,
        qaId: PropTypes.string,
        rootClassName: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { onClose } = this.props;

        return (
            <div
                className = { `modal ${this.props.rootClassName || ''}` }
                data-qa-id = { this.props.qaId }>
                <div className = 'modal-shroud' />
                <div className = 'modal-content'>
                    { this.props.children }
                    { onClose && <button
                        className = 'close modal-close'
                        data-qa-id = 'modal-close'
                        onClick = { onClose }
                        type = 'button'>
                        x
                    </button> }
                </div>
            </div>
        );
    }
}
