import { google } from 'calendars';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads the calendar service.
 *
 * @extends React.Component
 */
export class CalendarLoader extends AbstractLoader {
    static propTypes = AbstractLoader.propTypes;

    /**
     * @override
     */
    _getPropsForChildren() {
        return {
            calendarService: google
        };
    }

    /**
     * @override
     */
    _loadService() {
        return google.initialize();
    }
}

export default generateWrapper(CalendarLoader);
