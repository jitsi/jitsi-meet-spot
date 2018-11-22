import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import { COMMANDS, remoteControlService } from 'remote-control';

import styles from './remote-control-menu.css';

/**
 * A React Component for inputting and submitting post-call feedback by leaving
 * a rating and a
 *
 * @extends React.Component
 */
export default class FeedbackForm extends React.Component {
    static propTypes = {
        remoteId: PropTypes.string
    };

    /**
     * Initializes a new {@code FeedbackForm} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            message: '',
            score: -1
        };

        this._onMessageChange = this._onMessageChange.bind(this);
        this._onRatingChange = this._onRatingChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
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
                className = { styles.feedback }
                onSubmit = { this._onSubmit }>
                { this._renderStars() }
                <textarea
                    autoFocus = { true }
                    className = { styles.comment }
                    onChange = { this._onMessageChange }
                    value = { this.state.message } />
                <Button type = 'submit'>Submit</Button>
            </form>
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
            const starClass = i <= score ? 'icon-star-full' : 'icon-star';

            stars.push(
                <a
                    className = { `${starClass} ${styles.score}` }
                    onClick = { () => this._onRatingChange(i) }
                    key = { i } />
            );
        }

        return stars;
    }

    /**
     * Updates the known feedback description that has been entered.
     *
     * @param {Event} event - The change event triggered when entered feedback
     * text has been updated.
     * @private
     * @returns {void}
     */
    _onMessageChange(event) {
        this.setState({ message: event.target.value });
    }

    /**
     * Updates the known number of stars selected for rating the meeting
     * experience.
     *
     * @param {int} score - The star value that has been selected.
     * @private
     * @returns {void}
     */
    _onRatingChange(score) {
        this.setState({ score });
    }

    /**
     * Sends the entered feedback to the application so it can be submitted.
     *
     * @param {Event} event - The submit event passed through by the form.
     * @private
     * @returns {void}
     */
    _onSubmit(event) {
        event.preventDefault();

        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.SUBMIT_FEEDBACK, this.state);
    }
}
