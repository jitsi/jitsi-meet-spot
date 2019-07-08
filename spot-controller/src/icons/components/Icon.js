import PropTypes from 'prop-types';
import React from 'react';

const DEFAULT_SIZE = 36;

/**
 * Implements an Icon component that takes a loaded SVG file as prop and renders it as an icon.
 */
export default class Icon extends React.PureComponent {
    static propTypes = {
        color: PropTypes.string,
        height: PropTypes.number,
        src: PropTypes.func,
        width: PropTypes.number
    }

    /**
     * Implements {@code Component.render}.
     *
     * @inheritdoc
     */
    render() {
        const {
            color,
            height,
            width,
            src: SrcComponent
        } = this.props;

        return (
            <SrcComponent
                fill = { color || 'white' }
                height = { height || DEFAULT_SIZE }
                width = { width || DEFAULT_SIZE } />
        );
    }
}
