import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import { COMMANDS, remoteControlService } from 'remote-control';

import styles from './remote-control-menu.css';

export default class FeedbackForm extends React.Component {
    static propTypes = {
        remoteId: PropTypes.string
    };

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

    _onMessageChange(event) {
        this.setState({ message: event.target.value });
    }

    _onRatingChange(score) {
        this.setState({ score });
    }

    _onSubmit(event) {
        event.preventDefault();

        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.SUBMIT_FEEDBACK, this.state);
    }
}
