import { getBackgroundUrl } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';

interface IProps {
    backgroundUrl?: string;
}

/**
 * Functional component for showing the configured background image URL with
 *  a gradient.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 * */
export function Background({ backgroundUrl }: IProps) {
    let backgroundStyles;

    if (backgroundUrl) {
        backgroundStyles = {
            background: `url('${backgroundUrl}')`
        };
    }

    return (
        <div
            className = 'view-background-container'
            style = { backgroundStyles }>
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
function mapStateToProps(state: any) {
    return {
        backgroundUrl: getBackgroundUrl(state)
    };
}

export default connect(mapStateToProps)(Background);
