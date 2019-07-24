import crypto from 'crypto';
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('./src/common/logger');

global.fetch = require('jest-fetch-mock');

global.crypto = {
    getRandomValues: buffer => crypto.randomFillSync(buffer)
};
