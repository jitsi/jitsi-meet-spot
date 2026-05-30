import React from 'react';

interface ISourcePreviewProps {
    onClick?: (source: any) => void;
    onDoubleClick?: (source: any) => void;
    selected?: boolean;
    source?: any;
}

/**
 * A component for displaying a desktop source preview by showing its thumbnail
 * and label.
 */
export default class SourcePreview extends React.Component<ISourcePreviewProps> {
    /**
     * Initializes a new {@code SourcePreview} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: ISourcePreviewProps) {
        super(props);

        this._onClick = this._onClick.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
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
     * Callback invoked when {@code SourcePreview} is single clicked.
     *
     * @private
     * @returns
     */
    _onClick() {
        this.props.onClick?.(this.props.source);
    }

    /**
     * Callback invoked when {@code SourcePreview} is double clicked.
     *
     * @private
     * @returns
     */
    _onDoubleClick() {
        this.props.onDoubleClick?.(this.props.source);
    }
}
