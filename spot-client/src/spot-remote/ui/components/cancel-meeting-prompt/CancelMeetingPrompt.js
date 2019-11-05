import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Button } from 'common/ui';

/**
 * Displays a prompt to immediately stop trying to join a meeting.
 */
export class CancelMeetingPrompt extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { onSubmit, t } = this.props;

        return (
            <div className = 'conference-status-notice'>
                <div className = 'cta'>{ t('conferenceStatus.slowJoin') }</div>
                <Button
                    onClick = { onSubmit }
                    qaId = 'cancel-meeting'>
                    { t('buttons.cancel') }
                </Button>
            </div>
        );
    }
}

export default withTranslation()(CancelMeetingPrompt);
