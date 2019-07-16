import React from 'react';

/**
 * A component indicating loading is occurring.
 *
 * @returns {ReactElement}
 */
export default function LoadingIcon() {
    return (
        <div className = 'loading-icon'>
            <div>.</div>
            <div>.</div>
            <div>.</div>
        </div>
    );
}
