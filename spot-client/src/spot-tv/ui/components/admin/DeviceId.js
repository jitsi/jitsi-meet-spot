import React, { memo } from 'react';
import { getDeviceId } from 'common/utils';

import AdminEntry from './admin-entry';

/**
 * Displays the debug device id.
 *
 * @returns {ReactNode}
 */
function DeviceId() {
    return (
        <AdminEntry entryLabel = 'Device ID'>
            { getDeviceId() }
        </AdminEntry>
    );
}

export default memo(DeviceId);
