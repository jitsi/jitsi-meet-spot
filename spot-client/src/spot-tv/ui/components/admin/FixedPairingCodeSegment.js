import { getFixedCodeSegment, setFixedCodeSegment } from 'common/app-state';
import { Button, Input } from 'common/ui';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import AdminEntry from './admin-entry';

/**
 * Implements a component that lets the admin set the permanent segment of the pairing code.
 */
class FixedPairingCodeSegment extends PureComponent {
    static propTypes = {
        fixedCodeSegment: PropTypes.string,
        setFixedCodeSegment: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            fixedCodeSegment: props.fixedCodeSegment || '',
            showField: false
        };

        this._onClick = this._onClick.bind(this);
        this._onSave = this._onSave.bind(this);
        this._onSegmentChange = this._onSegmentChange.bind(this);
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { t } = this.props;
        const { showField } = this.state;
        let content;

        if (showField) {
            content = this._renderField();
        } else {
            content = (
                <Button
                    onClick = { this._onClick }
                    qaId = 'fixed-segment-button'>
                    { t('admin.change') }
                </Button>
            );
        }

        return (
            <AdminEntry entryLabel = { t('admin.fixedSegment') }>
                { content }
            </AdminEntry>
        );
    }

    /**
     * Callback to handle the show field button click.
     *
     * @returns {void}
     */
    _onClick() {
        this.setState({
            showField: true
        });
    }

    /**
     * Callback to handle the save button click.
     *
     * @returns {void}
     */
    _onSave() {
        this.props.setFixedCodeSegment(this.state.fixedCodeSegment.substring(0, 2));
        this.setState({
            showField: false
        });
    }

    /**
     * Callback to be invoked on field value change.
     *
     * @param {Event} evt - The native event of the field value change.
     * @returns {void}
     */
    _onSegmentChange(evt) {
        this.setState({
            fixedCodeSegment: evt.target.value.toUpperCase()
        });
    }

    /**
     * Renders the field component when that's requested.
     *
     * @returns {ReactElement}
     */
    _renderField() {
        const { t } = this.props;

        return (
            <div className = 'field-wrapper'>
                <Input
                    data-qa-id = 'fixed-segment-field'
                    inputProps = {{
                        maxLength: 2
                    }}
                    onChange = { this._onSegmentChange }
                    placeholder = { t('admin.fixedSegmentPlaceholder') }
                    value = { this.state.fixedCodeSegment } />
                <Button
                    onClick = { this._onSave }
                    qaId = 'fixed-segment-button-save'>
                    { t('admin.save') }
                </Button>
            </div>
        );
    }
}

/**
 * Maps part of the Redux state to the props of the component.
 *
 * @param {State} state - The Redux state.
 * @returns {Props}
 */
function mapStateToProps(state) {
    return {
        fixedCodeSegment: getFixedCodeSegment(state).toUpperCase()
    };
}

/**
 * Maps Redux actions to the props of the component.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        setFixedCodeSegment(fixedCodeSegment) {
            return dispatch(setFixedCodeSegment(fixedCodeSegment));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FixedPairingCodeSegment));
