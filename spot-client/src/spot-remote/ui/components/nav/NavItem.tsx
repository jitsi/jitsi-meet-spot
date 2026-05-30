import React from 'react';

interface INavItemProps {
    active?: boolean;
    children?: any;
    id?: string;
    label?: string;
    onClick?: (...args: any[]) => void;
    qaId?: string;
}

/**
 * Displays a button within the nav.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function NavItem({ id, active, children, label, onClick, qaId }: INavItemProps) {
    const className = `nav-item ${active ? 'active' : ''}`;

    return (
        <button
            className = { className }
            data-qa-id = { qaId }
            id = { id }
            onClick = { onClick }
            type = 'button'>
            <div className = 'nav-item-content'>
                { children }
            </div>
            <div className = 'nav-item-label'>
                { label }
            </div>
        </button>
    );
}
