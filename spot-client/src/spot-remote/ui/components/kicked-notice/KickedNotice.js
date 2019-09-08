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
        return (
            <div className = 'kicked-notice'>
                <div className = 'cta'>
                    { this.props.t('appStatus.kicked') }
                </div>
                <Button onClick = { this.props.onSubmit }>
                    { this.props.t('buttons.continue') }
                </Button>
            </div>
        );
    }
}

export default withTranslation()(KickedNotice);

