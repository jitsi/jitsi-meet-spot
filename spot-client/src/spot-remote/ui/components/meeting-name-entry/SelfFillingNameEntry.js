import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';
import { getRandomMeetingName } from 'common/utils';
import MeetingNameEntry from './MeetingNameEntry';

/**
 * Wraps {@code MeetingNameEntry} in a component which shows a different
 * placeholder after an inactivity timeout. The methods
 * _clearRandomMeetingNameProcess and _createGenerateMeetingNameTimeout are
 * called circularly to create the effect.
 *
 * @extends React.Component
 */
export class SelfFillingNameEntry extends React.Component {
    static defaultProps = {
        animationRevealRate: 100,
        animationStartDelay: 5000
    };

    static propTypes = {
        animationRevealRate: PropTypes.number,
        animationStartDelay: PropTypes.number,
        domain: PropTypes.string,
        onSubmit: PropTypes.func,
        tenant: PropTypes.string
    };

    /**
     * Initializes a new {@code SelfFillingNameEntry} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        /**
         * The interval which will reveal a generated placeholder one character
         * at a time.
         *
         * @type {intervalID}
         */
        this._animationInterval = null;

        /**
         * The last randomly generated meeting name. Stored on the instance so
         * the full meeting name can be submitted if no meeting name has been
         * entered.
         *
         * @type {string}
         */
        this._fullGeneratedMeetingName = '';

        /**
         * The timeout which when fired will store a randomly generated meeting
         * name on this instance, to be revealed by
         * {@link this._animationInterval}.
         *
         * @type {timeoutId}
         */
        this._generateRoomNameTimeout = null;

        this.state = {
            animatingPlaceholder: '',
            enteredMeetingName: ''
        };

        this._onBlur = this._onBlur.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Enqueues the generation of a random meeting name to display in the
     * placeholder and the animated reveal of the meeting name.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._createGenerateMeetingNameTimeout();
    }

    /**
     * Clears any async functions queued related to the animated display of a
     * random meeting name.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._clearRandomMeetingNameProcess();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <MeetingNameEntry
                domain = { this._getDomainToDisplay() }
                meetingName = { this.state.enteredMeetingName }
                onBlur = { this._onBlur }
                onChange = { this._onChange }
                onSubmit = { this._onSubmit }
                placeholder = { this.state.animatingPlaceholder } />
        );
    }

    /**
     * Stops the async process of creating a random meeting name and revealing
     * it letter-by-letter in the placeholder of {@code MeetingNameEntry}.
     *
     * @private
     * @returns {void}
     */
    _clearRandomMeetingNameProcess() {
        clearInterval(this._animationInterval);
        this._animationInterval = null;

        clearTimeout(this._generateRoomNameTimeout);
        this._generateRoomNameTimeout = null;
    }

    /**
     * The entry point to process of automatically generating a random meeting
     * name and displaying it as a placeholder. Sets a timeout to trigger the
     * process, which should fire if there is no activity with this component.
     *
     * @private
     * @returns {void}
     */
    _createGenerateMeetingNameTimeout() {
        this._clearRandomMeetingNameProcess();

        this._generateRoomNameTimeout = setTimeout(() => {
            this._createAnimatingPlaceholderInterval();
        }, this.props.animationStartDelay);
    }

    /**
     * Creates a random meeting name and creates an interval to reveal the name
     * letter-by-letter. Will call {@code _createGenerateMeetingNameTimeout} to
     * make a new random meeting name.
     *
     * @private
     * @returns {void}
     */
    _createAnimatingPlaceholderInterval() {
        this._fullGeneratedMeetingName = getRandomMeetingName();
        let currentLengthToShow = 1;

        this._animationInterval = setInterval(() => {
            // If the entire random name has been revealed then queue the
            // generation and animation of a new random name.
            if (currentLengthToShow > this._fullGeneratedMeetingName.length) {
                this._clearRandomMeetingNameProcess();
                this._createGenerateMeetingNameTimeout();

                return;
            }

            // Otherwise show the random name letter-by-letter.
            this.setState({
                animatingPlaceholder: this._fullGeneratedMeetingName.substr(
                    0, currentLengthToShow)
            });

            currentLengthToShow += 1;
        }, this.props.animationRevealRate);
    }

    /**
     * Returns what the domain displayed should be. Will include the tenant
     * of necessary.
     *
     * @private
     * @returns {string}
     */
    _getDomainToDisplay() {
        const { domain, tenant } = this.props;

        if (this.state.enteredMeetingName.startsWith('/')) {
            return domain;
        } else if (tenant) {
            return `${domain}/${tenant}/`;
        }

        return `${domain}/`;

    }

    /**
     * Callback invoked when the meeting name input is no longer in focus.
     * Starts a timeout to generate a random meeting name to display in the
     * input, if no meeting name has been entered.
     *
     * @private
     * @returns {void}
     */
    _onBlur() {
        if (!this.state.enteredMeetingName) {
            this._createGenerateMeetingNameTimeout();
        }
    }

    /**
     * Callback invoked as the entered meeting name in {@code MeetingNameEntry}
     * is updated. Updates the known state of the entered meeting name.
     *
     * @param {string} enteredMeetingName - The meeting name as it has been
     * typed into the input.
     * @private
     * @returns {void}
     */
    _onChange(enteredMeetingName) {
        if (enteredMeetingName) {
            this._clearRandomMeetingNameProcess();
        }

        this.setState({
            animatingPlaceholder: '',
            enteredMeetingName
        });
    }

    /**
     * Callback invoked when a meeting name has been submitted for joining.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const { enteredMeetingName } = this.state;

        let meetingToJoin;

        if (enteredMeetingName) {
            meetingToJoin = enteredMeetingName.startsWith('/')
                ? `https://${this.props.domain}${enteredMeetingName}`
                : enteredMeetingName;
        } else {
            meetingToJoin = this._fullGeneratedMeetingName || getRandomMeetingName();
        }

        logger.log('meeting name submitted', {
            enteredMeetingName,
            generatedName: this._fullGeneratedMeetingName,
            meetingToJoin
        });

        this.props.onSubmit(meetingToJoin);
    }
}

export default SelfFillingNameEntry;
