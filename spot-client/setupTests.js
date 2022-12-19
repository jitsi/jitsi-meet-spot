import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('./src/common/logger');

jest.mock('common/vendor', () => {
    const { mockJitsiMeetJSProvider } = require('./src/common/test-mocks');

    return {
        JitsiMeetJSProvider: mockJitsiMeetJSProvider
    };
});

require('jest-fetch-mock').enableMocks();
