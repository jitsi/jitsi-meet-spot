import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for displaying a desktop source preview by showing its thumbnail
 * and label.
 *
 * @extends React.Component
 */
export default class SourcePreview extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        selected: PropTypes.bool,
        source: PropTypes.object
    }

    /**
     * Initializes a new {@code SourcePreview} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onClick = this._onClick.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            selected,
            source
        } = this.props;

        const className = selected ? 'picker-choice selected' : 'picker-choice';

        return (
            <button
                className = { className }
                onClick = { this._onClick }
                onDoubleClick = { this._onDoubleClick }>
                <img
                    className = 'picker-choice-thumbnail'
                    src = { source.thumbnail.toDataURL() } />
                <span className = 'picker-choice-label'>
                    { source.name }
                </span>
            </button>
        );
    }

    /**
     * Callback invoked when {@code SourcePreview} is singe clicked.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this.props.onClick(this.props.source);
    }

    /**
     * Callback invoked when {@code SourcePreview} is double clicked.
     *
     * @private
     * @returns {void}
     */
    _onDoubleClick() {
        this.props.onDoubleClick(this.props.source);
    }
}
