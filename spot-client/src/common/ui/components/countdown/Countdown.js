import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

/**
 * Displays a number in seconds which decrements each second.
 */
export class Countdown extends React.Component {
    static defaultProps = {
        startTime: 20
    };

    static propTypes = {
        onCountdownComplete: PropTypes.func,
        startTime: PropTypes.number,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code Countdown} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            time: props.startTime
        };
    }

    /**
     * Sets the interval to update the timer display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.countdownInterval = setInterval(() => {
            const newTime = this.state.time - 1;

            if (newTime <= 0) {
                clearInterval(this.countdownInterval);
                this.props.onCountdownComplete();
            }

            this.setState({ time: this.state.time - 1 });
        }, 1000);
    }

    /**
     * Clears any active timer update interval.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearInterval(this.countdownInterval);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'countdown'>
                {
                    this.props.t('countdown.timeLeft', {
                        count: this.state.time
                    })
                }
            </div>
        );
    }
}

export default withTranslation()(Countdown);
