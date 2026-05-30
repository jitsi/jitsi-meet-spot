import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * The props for {@link KickedNotice}.
 */
interface IProps {

    /**
     * Callback invoked when the notice is dismissed.
     */
    onSubmit?: (...args: any[]) => void;

    /**
     * The i18n translate function.
     */
    t?: (key: string) => string;
}

/**
 * Informs that the Spot-TV has been removed from the conference.
 */
export class KickedNotice extends React.Component<IProps> {
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
                <div className = 'cta'>{ t?.('conferenceStatus.kicked') }</div>
                <Button onClick = { onSubmit }>{ t?.('buttons.continue') }</Button>
            </div>
        );
    }
}

export default withTranslation()(KickedNotice);
