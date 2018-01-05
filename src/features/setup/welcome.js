import PropTypes from 'prop-types';
import React from 'react';

export class Welcome extends React.Component {
    static propTypes = {
        onSuccess: PropTypes.func
    };

    render() {
        return (
            <div>
                <div>Welcome To Spot</div>
                <button onClick = { this.props.onSuccess }>Next</button>
            </div>
        );
    }
}

export default Welcome;
