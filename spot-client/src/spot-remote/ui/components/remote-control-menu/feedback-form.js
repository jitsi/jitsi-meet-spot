import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Star, StarBorder } from 'common/icons';
import { logger } from 'common/logger';
import { submitFeedback } from 'spot-remote/remote-control';

/**
 * By default will use 1 minute for feedback inactivity timeout.
 *
 * @type {number}
 */
const DEFAULT_INACTIVITY_TIMEOUT = 60 * 1000;

/**
 * A React Component for inputting and submitting post-call feedback by leaving
 * a rating and a
 *
 * @extends React.Component
 */
class FeedbackForm extends React.Component {
    static propTypes = {
        _submitFeedback: PropTypes.func,
        timeout: PropTypes.number
    };

    static defaultProps = {
        timeout: DEFAULT_INACTIVITY_TIMEOUT
    };

    /**
     * The inactivity timeout ID.
     *
     * @type {number|null}
     */
    _timeout = null;

    /**
     * Initializes a new {@code FeedbackForm} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            hasSubmittedStars: false,
            message: '',
            requestMoreInfo: false,
            score: -1
        };

        this._onMessageChange = this._onMessageChange.bind(this);
        this._onRatingChange = this._onRatingChange.bind(this);
        this._onSkip = this._onSkip.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Restarts the idle timeout when the component is mounted.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._restartInactivityTimeout();
    }

    /**
     * Cancels the inactivity timeout when the component is unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._cancelInactivityTimeout();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <form
                className = 'remote-feedback'
                onSubmit = { this._onSubmit }>
                <div className = 'cta'>Rate your experience</div>
                { this.state.requestMoreInfo
                    ? this._renderInfoRequest()
                    : this._renderStars() }
                <button
                    className = 'skip-button'
                    onClick = { this._onSkip }
                    type = 'button'>
                    Skip
                </button>
                <button
                    className = 'submit-button'
                    type = 'submit'>
                    Send
                </button>
            </form>
        );
    }

    /**
     * Cancels the inactivity timeout.
     *
     * @private
     * @returns {void}
     */
    _cancelInactivityTimeout() {
        clearTimeout(this._timeout);
        this._timeout = null;
    }

    /**
     * Callback invoked when the entered additional feedback details is updated.
     *
     * @param {ChangeEvent} e - The DOM event from the message field being
     * updated.
     * @private
     * @returns {void}
     */
    _onMessageChange(e) {
        this.setState({
            message: e.target.value
        });
        this._restartInactivityTimeout();
    }

    /**
     * Updates the known number of stars selected for rating the meeting
     * experience.
     *
     * @param {number} score - The star value that has been selected.
     * @private
     * @returns {void}
     */
    _onRatingChange(score) {
        this.setState({ score });
        this._restartInactivityTimeout();
    }

    /**
     * Dismiss feedback without submitting any feedback.
     *
     * @private
     * @returns {void}
     */
    _onSkip() {
        this.props._submitFeedback({
            message: '',
            score: -1
        });
    }

    /**
     * Sends the entered feedback to the Spot instance so it can be submitted.
     *
     * @param {Event} event - The submit event passed through by the form.
     * @private
     * @returns {void}
     */
    _onSubmit(event) {
        event.preventDefault();

        if (!this.state.hasSubmittedStars
            && this.state.score <= 3
            && this.state.score !== -1) {
            logger.log('Feedback requesting additional information');

            this.setState({
                hasSubmittedStars: true,
                requestMoreInfo: true
            });

            return;
        }

        this._submitFeedback();
    }

    /**
     * Renders a React Element for entering additional details about the
     * submitted rating.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderInfoRequest() {
        return (
            <div>
                <div className = 'message-help'>
                    Please tell us more about it.
                </div>
                <textarea
                    autoFocus = { true }
                    className = 'remote-message'
                    onChange = { this._onMessageChange }
                    rows = { 4 }
                    spellCheck = { false }
                    value = { this.state.message } />
            </div>
        );
    }

    /**
     * Instantiates styled stars to display for the meeting rating, each of
     * which display in a filled or empty state depending on the selected
     * rating.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    _renderStars() {
        const { score } = this.state;

        const stars = [];

        for (let i = 1; i <= 5; i++) {
            const starIcon = i <= score ? <Star /> : <StarBorder />;

            stars.push(
                <button
                    className = 'remote-score'
                    key = { i }

                    // eslint-disable-next-line react/jsx-no-bind
                    onClick = { () => this._onRatingChange(i) }
                    type = 'button'>
                    { starIcon }
                </button>
            );
        }

        return (
            <div className = 'stars'>
                { stars }
            </div>
        );
    }

    /**
     * Restarts the inactivity timeout.
     *
     * @private
     * @returns {void}
     */
    _restartInactivityTimeout() {
        this._cancelInactivityTimeout();
        if (this.props.timeout && this.props.timeout > 0) {
            this._timeout = setTimeout(
                () => {
                    this._submitFeedback(/* timeout */true);
                },
                this.props.timeout);
        }
    }

    /**
     * Submits the feedback currently stored in the state (whatever it is).
     *
     * @param {boolean} timeout - If set to true it means that the call's been made as the result of
     * inactivity timeout rather than explicit user's action.
     * @private
     * @returns {void}
     */
    _submitFeedback(timeout = false) {
        if (timeout) {
            logger.log('Feedback submitting by inactivity timeout');
        } else {
            logger.log('Feedback submitting');
        }

        this.props._submitFeedback({
            message: this.state.message,
            requestedMoreInfo: this.state.requestMoreInfo,
            score: this.state.score,
            timeout
        });
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Object} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Dispatches the submit feedback action.
         *
         * @param {Object} options - The options as defined by the {@link submitFeedback} action.
         * @private
         * @returns {void}
         */
        _submitFeedback(options) {
            dispatch(submitFeedback(options));
        }
    };
}
export default connect(undefined, mapDispatchToProps)(FeedbackForm);
