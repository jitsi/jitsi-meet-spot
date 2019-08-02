import { Button as MaterialButton } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const classes = {
    label: 'button-label'
};
const mapActionTypeToStyle = {
    'subtle-danger': {
        className: 'button subtle-danger',
        color: 'default',
        variant: 'outlined'
    },
    primary: {
        className: 'button primary',
        color: 'primary',
        variant: 'contained'
    },
    secondary: {
        className: 'button secondary',
        color: 'default',
        variant: 'contained'
    },
    subtle: {
        className: 'button subtle',
        color: 'default',
        variant: 'outlined'
    }
};

/**
 * A component for a styled {@code HTMLButtonElement}.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Button(props) {
    const mappedProps = mapActionTypeToStyle[props.appearance];

    return (
        <MaterialButton
            { ...mappedProps }
            className = { `${mappedProps.className} ${props.className}` }
            classes = { classes }
            data-qa-id = { props.qaId }
            disableRipple = { true }
            disabled = { props.disabled }
            onClick = { props.onClick }
            type = { props.type } >
            { props.children }
        </MaterialButton>
    );
}

Button.defaultProps = {
    appearance: 'primary',
    className: '',
    disabled: false,
    type: 'button'
};

Button.propTypes = {
    appearance: PropTypes.string,
    children: PropTypes.any,
    className: PropTypes.string,
    'data-qa-id': PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    qaId: PropTypes.string,
    type: PropTypes.string
};
