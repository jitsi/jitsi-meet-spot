import { Button as MaterialButton } from '@mui/material';
import React from 'react';

interface IButtonProps {
    appearance?: string;
    children?: any;
    className?: string;
    'data-qa-id'?: string;
    disabled?: boolean;
    onClick?: (...args: any[]) => void;
    qaId?: string;
    type?: string;
}

const classes = {
    label: 'button-label'
};
const mapActionTypeToStyle: Record<string, { className: string; variant: 'outlined' | 'contained'; }> = {
    'subtle-danger': {
        className: 'button subtle-danger',
        variant: 'outlined'
    },
    primary: {
        className: 'button primary',
        variant: 'contained'
    },
    secondary: {
        className: 'button secondary',
        variant: 'contained'
    },
    subtle: {
        className: 'button subtle',
        variant: 'outlined'
    }
};

/**
 * A component for a styled {@code HTMLButtonElement}.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns
 */
export default function Button({
    appearance = 'primary',
    children,
    className = '',
    disabled = false,
    onClick,
    qaId,
    type = 'button'
}: IButtonProps) {
    const mappedProps = mapActionTypeToStyle[appearance];

    return (
        <MaterialButton
            { ...mappedProps }
            className = { `${mappedProps.className} ${className} ${qaId}` }
            classes = { classes }
            data-qa-id = { qaId }
            disableRipple = { true }
            disabled = { disabled }
            onClick = { onClick }
            type = { type as any } >
            { children }
        </MaterialButton>
    );
}
