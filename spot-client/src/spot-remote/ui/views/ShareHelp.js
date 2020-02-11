import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { View } from 'common/ui';

/**
 * Displays a message stating the permanent remotes cannot enter share mode.
 *
 * @returns {ReactElement}
 */
export function ShareHelp({ t }) {
    return (
        <View name = 'share-help'>
            <div className = 'unsupported-browser'>
                <div>{ t('appStatus.noPermanentRemoteShare')}</div>
            </div>
        </View>
    );
}

ShareHelp.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(ShareHelp);
