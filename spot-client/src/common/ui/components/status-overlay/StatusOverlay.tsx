import React from 'react';

import { Background } from '../background';

interface IProps {

    /**
     * The content to display within the overlay.
     */
    children?: any;

    /**
     * A test identifier to set on the overlay element.
     */
    qaId?: string;

    /**
     * Whether or not to show the background.
     */
    showBackground?: boolean;

    /**
     * The title to display.
     */
    title?: string;
}

/**
 * Displays a status message while covering the entire screen.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function StatusOverlay(props: IProps) {
    return (
        <div
            className = 'status-overlay'
            data-qa-id = { props.qaId } >
            <Background />
            <div className = 'status-overlay-text-frame'>
                <h1>{ props.title }</h1>
                <div className = 'status-overlay-text'>
                    { props.children }
                </div>
            </div>
        </div>
    );
}
