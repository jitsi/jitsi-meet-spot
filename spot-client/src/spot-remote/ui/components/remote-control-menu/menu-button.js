import PropTypes from 'prop-types';
import React from 'react';

const MenuButton = ({ label, onClick }) => (
    <button
        className = 'button menu touch-highlight'
        onClick = { onClick } >
        { label }
    </button>
);

MenuButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func
};

export default MenuButton;
