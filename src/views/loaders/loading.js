import React from 'react';

import { LoadingIcon } from 'features/loading-icon';

import View from '../view';
import styles from '../view.css';

/**
 * The initial view of the application which displays a loading indicator while
 * bootstrapping an application service.
 *
 * @returns {ReactElement}
 */
export default function Loading() {
    return (
        <View>
            <div className = { styles.loading }>
                <LoadingIcon color = 'white' />
            </div>
        </View>
    );
}

