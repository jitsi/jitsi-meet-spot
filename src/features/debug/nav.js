import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../../routing/constants';
import styles from './nav.css';

/**
 * A component with links to switch between different views of Spot.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Nav() {
    return (
        <nav className = { styles.nav }>
            <Link to = { ROUTES.ADMIN }>Admin</Link>
            <Link to = { ROUTES.HOME }>Home</Link>
            <Link to = { ROUTES.SETUP }>Setup</Link>
        </nav>
    );
}
