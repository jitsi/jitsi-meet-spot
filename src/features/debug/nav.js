import React from 'react';
import { Link } from 'react-router-dom';

import styles from './nav.css';

export default class Nav extends React.Component {
    constructor(props) {
        super(props);

        this._openCommandDebug = this._openCommandDebug.bind(this);
    }

    render() {
        return (
            <nav className = { styles.nav }>
                <Link to = '/admin'>Admin</Link>
                <Link to = '/meeting/spot-test-test-spot'>Meeting</Link>
                <Link to = '/setup'>Setup</Link>
                <Link to = '/'>Calendar</Link>
                <Link to = '/asdfsdf'>Nonexistent</Link>
                <a onClick = { this._openCommandDebug }>Commands</a>
            </nav>
        );
    }

    _openCommandDebug() {
        const url = `${window.location.origin}${
            window.location.pathname}#/remote-control-debug`;

        window.open(url, '_blank', 'noopener');
    }
}
