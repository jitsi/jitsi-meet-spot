import React from 'react';
import type { SvgProps } from 'react-native-svg';

const DEFAULT_SIZE = 36;

interface IconProps {
    color?: string;
    height?: number;
    src: React.FC<SvgProps>;
    width?: number;
}

/**
 * Implements an Icon component that takes a loaded SVG file as prop and renders it as an icon.
 */
export default class Icon extends React.PureComponent<IconProps> {
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
