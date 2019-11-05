import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Button } from 'common/ui';

/**
 * Informs that the Spot-TV has been removed from the conference.
 *
 * @extends React.Component
 */
export class KickedNotice extends React.Component {
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
                <div className = 'cta'>{ t('conferenceStatus.kicked') }</div>
                <Button onClick = { onSubmit }>{ t('buttons.continue') }</Button>
            </div>
        );
    }
}

export default withTranslation()(KickedNotice);
