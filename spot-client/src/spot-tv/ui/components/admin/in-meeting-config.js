import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setMeetingToolbarVisible } from 'common/actions';
import { getMeetingOptions } from 'common/reducers';

/**
 * Changes some settings that determines he behavior of the Jitsi-Meet meeting.
 *
 * @extends ReactElement.Component
 */
export class InMeetingConfig extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        showMeetingToolbar: PropTypes.bool
    };

    /**
     * Initializes a new {@code InMeetingConfig} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onShowToolbarChange = this._onShowToolbarChange.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'admin-container'>
                <div className = 'admin-title'>
                    Meeting toggles
                </div>
                <div>
                    <label>
                        <input
                            checked = { this.props.showMeetingToolbar }
                            name = 'meeting-toolbar'
                            onChange = { this._onShowToolbarChange }
                            type = 'checkbox' />
                            Show toolbar
                    </label>
                </div>
            </div>
        );
    }

    /**
     * Callback invoked when the option to hide or show the in-meeting toolbar
     * is changed.
     *
     * @param {Object} event - The change event from toggling the checkbox.
     * @private
     * @returns {void}
     */
    _onShowToolbarChange({ target: { checked } }) {
        this.props.dispatch(setMeetingToolbarVisible(checked));
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code InMeetingConfig}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { showMeetingToolbar } = getMeetingOptions(state);

    return {
        showMeetingToolbar
    };
}

export default connect(mapStateToProps)(InMeetingConfig);
