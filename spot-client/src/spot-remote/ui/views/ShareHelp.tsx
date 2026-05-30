import { View } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';

interface IProps {
    t?: (key: string) => string;
}

/**
 * Displays a message stating the permanent remotes cannot enter share mode.
 *
 * @returns {ReactElement}
 */
export function ShareHelp({ t }: IProps) {
    return (
        <View name = 'share-help'>
            <div className = 'unsupported-browser'>
                <div>{ t?.('appStatus.noPermanentRemoteShare')}</div>
            </div>
        </View>
    );
}

export default withTranslation()(ShareHelp);
