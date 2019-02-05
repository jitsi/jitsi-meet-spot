import React from 'react';

import { LoadingIcon } from 'features/loading-icon';

import View from '../view';

/**
 * The initial view of the application which displays a loading indicator while
 * bootstrapping an application service.
 *
 * @returns {ReactElement}
 */
export default function Loading() {
    return (
        <View hideBackground = { true }>
            <div className = 'loading'>
                <LoadingIcon color = 'white' />
            </div>
        </View>
    );
}

