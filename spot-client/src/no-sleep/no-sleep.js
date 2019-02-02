import PropTypes from 'prop-types';
import React from 'react';
import NoSleepJS from 'nosleep.js';

/**
 * A component for automatically enabling {@code NoSleepLib}, which prevents
 * phones from automatically entering lock mode due to inactivity.
 *
 * @extends React.Component
 */
export default class NoSleep extends React.Component {
    static propTypes = {
        children: PropTypes.any
    };

    /**
     * Initializes a new {@code NoSleep} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._noSleepJS = new NoSleepJS();

        this._enableNoSleep = this._enableNoSleep.bind(this);
    }

    /**
     * Adds a listener to automatically start {@code NoSleepJS} on click. A
     * click handler is necessary to work on Android, per the lib's git history.
     *
     * @inheritdoc
     */
    componentDidMount() {
        document.addEventListener('click', this._enableNoSleep);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return this.props.children;
    }

    /**
     * Callback invoked to start {@code NoSleepJS}.
     *
     * @private
     * @returns {void}
     */
    _enableNoSleep() {
        document.removeEventListener('click', this._enableNoSleep, false);

        this._noSleepJS.enable();
    }
}
