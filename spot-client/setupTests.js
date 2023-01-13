import EnzymeAdapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme from 'enzyme';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('./src/common/logger');

jest.mock('common/vendor', () => {
    const { mockJitsiMeetJSProvider } = require('./src/common/test-mocks');

    return {
        JitsiMeetJSProvider: mockJitsiMeetJSProvider
    };
});

require('jest-fetch-mock').enableMocks();
