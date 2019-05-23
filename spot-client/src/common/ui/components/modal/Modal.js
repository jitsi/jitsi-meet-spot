import PropTypes from 'prop-types';
import React from 'react';

/**
 * Yeah.
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
        return (
            <div
                className = { `modal ${this.props.rootClassName || ''}` }
                data-qa-id = { this.props.qaId }>
                <div className = 'modal-shroud' />
                <div className = 'modal-content'>
                    <button
                        className = 'close'
                        onClick = { this.props.onClose }
                        type = 'button'>
                        x
                    </button>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
