import React from 'react';

interface IProps {
    children?: any;
}

/**
 * Container for NavItems to be displayed.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function NavList({ children }: IProps) {
    return (
        <div className = 'nav-list'>
            { children }
        </div>
    );
}
