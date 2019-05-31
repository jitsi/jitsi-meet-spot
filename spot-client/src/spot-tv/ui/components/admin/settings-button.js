import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { showModal } from 'common/app-state';
import { Settings } from 'common/icons';

import AdminModal from './admin';

/**
 * A cog that directs to the settings view on click.
 */
class SettingsButton extends React.Component {
    static propTypes = {
        onClose: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <a
                className = 'cog'
                data-qa-id = 'admin-settings'
                onClick = { this.props.onClose }>
                <Settings />
            </a>
        );
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Stop showing the {@code AdminModal}.
         *
         * @returns {void}
         */
        onClose() {
            dispatch(showModal(AdminModal));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(SettingsButton);
