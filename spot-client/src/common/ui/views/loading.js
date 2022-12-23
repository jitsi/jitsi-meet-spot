import React from 'react';

import { LoadingIcon } from './../components';
import View from './view';

/**
 * The initial view of the application which displays a loading indicator while
 * bootstrapping an application service.
 *
 * @returns {ReactElement}
 */
export default function Loading() {
    return (
        <View name = 'loading'>
            <div
                className = 'loading'
                data-qa-id = 'loading' >
                <LoadingIcon />
            </div>
        </View>
    );
}

