import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getJoinCode } from 'common/reducers';
import { windowHandler } from 'common/utils';

/**
 * Displays information necessary to input a join code to become a remote
 * control for a Spot.
 *
 * @extends React.Component
 */
class JoinInfo extends React.Component {
    static propTypes = {
        joinCode: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { joinCode } = this.props;

        if (!joinCode) {
            return null;
        }

        return (
            <div
                className = 'joinInfo'
                data-qa-id = { 'join-info' }>
                <div>
                    <span>connect at: </span>
                    <span>
                        { windowHandler.getBaseUrl() }
                    </span>
                </div>
                <div>
                    <span>sharing key: </span>
                    <span data-qa-id = 'join-code'>
                        { joinCode }
                    </span>
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code JoinInfo}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        joinCode: getJoinCode(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
