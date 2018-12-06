import { calendarService } from 'calendars';

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
    _loadService() {
        return calendarService.initialize();
    }
}

export default generateWrapper(CalendarLoader);
