import { mount } from 'enzyme';
import React from 'react';

import { mockT } from 'common/test-mocks';

import { MeetingNameEntry } from './MeetingNameEntry';

describe('MeetingNameEntry', () => {
    const MEETING_NAME = 'mock-meeting-name';
    const PLACEHOLDER = 'test-placeholder';

    let meetingNameEntry, onChangeCallback, onSubmitCallback;

    beforeEach(() => {
        onChangeCallback = jest.fn();
        onSubmitCallback = jest.fn();

        meetingNameEntry = mount(
            <MeetingNameEntry
                meetingName = { MEETING_NAME }
                onChange = { onChangeCallback }
                onSubmit = { onSubmitCallback }
                placeholder = { PLACEHOLDER }
                t = { mockT } />
        );
    });

    it('shows the placeholder', () => {
        expect(meetingNameEntry.find('input').props().placeholder).toEqual(PLACEHOLDER);
    });

    it('submits the name by clicking the submit button', () => {
        meetingNameEntry.find('button').simulate('submit');

        expect(onSubmitCallback).toHaveBeenCalled();
    });

    it('submits the name by pressing enter', () => {
        meetingNameEntry.find('input').simulate('submit');

        expect(onSubmitCallback).toHaveBeenCalled();
    });
});
