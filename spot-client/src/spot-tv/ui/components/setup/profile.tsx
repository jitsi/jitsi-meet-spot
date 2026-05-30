import {
    getCalendarName,
    getDisplayName,
    setDisplayName
} from 'common/app-state';
import { Button, Input } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


interface IProps {
    dispatch?: (...args: any[]) => any;
    displayName?: string;
    onSetDisplayName?: (displayName: string) => void;
    onSuccess?: () => void;
    t?: (key: string) => string;
}

interface IState {
    displayName: string;
}

/**
 * Prompts to set a display name and for the Spot-TV to use during meetings.
 */
export class Profile extends React.Component<IProps, IState> {
    /**
     * Initializes a new {@code Profile} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            displayName: props.displayName || ''
        };

        this._onDisplayNameChange = this._onDisplayNameChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { t } = this.props;

        return (
            <div className = 'spot-setup setup-step'>
                <div className = 'setup-title'>
                    { t?.('setup.profile') }
                </div>
                <div className = 'setup-content'>
                    <Input
                        onChange = { this._onDisplayNameChange }
                        placeholder = { t?.('setup.name') }
                        value = { this.state.displayName } />
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onSubmit }>
                        { t?.('buttons.submit') }
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Callback invoked to update the known entered room display name.
     *
     * @param event - The change event for updating the entered room
     * display name.
     * @private
     * @returns {void}
     */
    _onDisplayNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            displayName: event.target.value
        });
    }

    /**
     * Callback invoked to save the entered display name.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        if (!this.state.displayName.trim()) {
            return;
        }

        this.props.onSetDisplayName?.(this.state.displayName.trim());
        this.props.onSuccess?.();
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Profile}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        displayName: getDisplayName(state) || getCalendarName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        onSetDisplayName(displayName: string) {
            dispatch(setDisplayName(displayName));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(Profile)
);
