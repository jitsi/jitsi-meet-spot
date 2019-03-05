import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a button with a main value in the center and a sub value smaller
 * and below the main value.
 *
 * @extends React.Component
 */
export default class DialButton extends React.Component {
    static propTypes = {
        main: PropTypes.string,
        onClick: PropTypes.func,
        sub: PropTypes.string
    }

    /**
     * Initializes a new {@code DialButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <button
                className = 'dial-button'
                onClick = { this._onClick }
                type = 'button'>
                <span className = 'main'>{ this.props.main }</span>
                { typeof this.props.sub === 'undefined'
                    ? null
                    : <span className = 'sub'>{ this.props.sub }</span> }
            </button>
        );
    }

    /**
     * Invokes the passed in onClick callback when the component is clicked.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this.props.onClick(this.props.main);
    }
}
