import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


interface IProps {
    onSubmit?: (...args: any[]) => void;
    t?: (key: string) => string;
}

/**
 * Displays a prompt to immediately stop trying to join a meeting.
 */
export class CancelMeetingPrompt extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        const { onSubmit, t } = this.props;

        return (
            <div className = 'conference-status-notice'>
                <div className = 'cta'>{ t?.('conferenceStatus.slowJoin') }</div>
                <Button
                    onClick = { onSubmit }
                    qaId = 'cancel-meeting'>
                    { t?.('buttons.cancel') }
                </Button>
            </div>
        );
    }
}

export default withTranslation()(CancelMeetingPrompt);
