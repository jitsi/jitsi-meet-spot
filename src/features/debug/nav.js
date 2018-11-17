import React from 'react';
import { Link } from 'react-router-dom';

import styles from './nav.css';

/**
 * A component with links to switch between different views of the application.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Nav() {
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
