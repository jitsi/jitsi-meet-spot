import type { RootState } from 'common/app-state';
import { getBackgroundUrl, isSpot } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';

import WaveBackground from './WaveBackground';

interface IProps {
    backgroundUrl?: string;
    isSpotTv?: boolean;
}

/**
 * Functional component for showing the app background. When a background
 * image URL is configured it is displayed with a gradient. Otherwise Spot-TV
 * shows the default animated wave background (its constant motion helps avoid
 * burn-in on the TV it is left running on), while Spot-Remote keeps a plain
 * gradient over the page background color.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 * */
export function Background({ backgroundUrl, isSpotTv }: IProps) {
    if (!backgroundUrl && isSpotTv) {
        return (
            <div className = 'view-background-container'>
                <WaveBackground />
            </div>
        );
    }

    return (
        <div
            className = 'view-background-container'
            style = { backgroundUrl ? { background: `url('${backgroundUrl}')` } : undefined }>
            <div className = 'view-gradient' />
        </div>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code View}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        backgroundUrl: getBackgroundUrl(state),
        isSpotTv: isSpot(state)
    };
}

export default connect(mapStateToProps)(Background);
