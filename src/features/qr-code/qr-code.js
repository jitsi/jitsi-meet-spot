import PropTypes from 'prop-types';
import React from 'react';

export default function QRCode({ height, width, text }) {
    const encodedText = window.encodeURIComponent(text);
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=${height}x${width
    }&cht=qr&chl=${encodedText}`;

    return (
        <img src = { qrCodeUrl } />
    );
}

QRCode.defaultProps = {
    height: 150,
    text: '',
    width: 150
};

QRCode.propTypes = {
    height: PropTypes.number,
    text: PropTypes.string,
    width: PropTypes.number
};
