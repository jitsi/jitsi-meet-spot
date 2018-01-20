import React from 'react';
import { Link } from 'react-router-dom';

import styles from './nav.css';

export default class Nav extends React.Component {
    render() {
        return (
            <nav className = { styles.nav }>
                <Link to = '/admin'>Admin</Link>
                <Link to = '/meeting/spot-test-test-spot'>Meeting</Link>
                <Link to = '/setup'>Setup</Link>
                <Link to = '/'>Calendar</Link>
                <Link to = '/asdfsdf'>Nonexistent</Link>
            </nav>
        );
    }
}
