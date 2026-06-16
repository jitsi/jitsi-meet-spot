import { fireEvent, render, screen } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';


import { MeetingNameEntry } from './MeetingNameEntry';

describe('MeetingNameEntry', () => {
    const MEETING_NAME = 'mock-meeting-name';
    const PLACEHOLDER = 'test-placeholder';

    let onChangeCallback: jest.Mock;
    let onSubmitCallback: jest.Mock;

    beforeEach(() => {
        onChangeCallback = jest.fn();
        onSubmitCallback = jest.fn();

        render(
            <MeetingNameEntry
                meetingName = { MEETING_NAME }
                onChange = { onChangeCallback }
                onSubmit = { onSubmitCallback }
                placeholder = { PLACEHOLDER }
                t = { mockT } />
        );
    });

    it('shows the placeholder', () => {
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', PLACEHOLDER);
    });

    it('submits the name by clicking the submit button', () => {
        fireEvent.submit(screen.getByRole('button'));

        expect(onSubmitCallback).toHaveBeenCalled();
    });

    it('submits the name by pressing enter', () => {
        fireEvent.submit(screen.getByRole('textbox'));

        expect(onSubmitCallback).toHaveBeenCalled();
    });
});
