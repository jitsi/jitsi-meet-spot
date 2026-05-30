import React from 'react';

interface IAdminEntryProps {
    children?: any;
    entryLabel?: string;
}

/**
 * Implements a component that renders an admin modal entry.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function AdminEntry(props: IAdminEntryProps) {
    return (
        <div className = 'admin-entry'>
            <div className = 'admin-entry-title'>
                { props.entryLabel }
            </div>
            <div className = 'admin-entry-content'>
                { props.children }
            </div>
        </div>
    );
}
