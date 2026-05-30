import React from 'react';
import { withTranslation } from 'react-i18next';

interface IProps {
    onCountdownComplete?: () => void;
    startTime?: number;
    t: (key: string, options?: any) => string;
}

interface IState {
    time: number;
}

/**
 * Displays a number in seconds which decrements each second.
 */
export class Countdown extends React.Component<IProps, IState> {
    static defaultProps = {
        startTime: 20
    };

    countdownInterval: ReturnType<typeof setInterval> | undefined;

    /**
     * Initializes a new {@code Countdown} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            time: props.startTime ?? 20
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
                this.props.onCountdownComplete?.();
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
     * @returns
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
