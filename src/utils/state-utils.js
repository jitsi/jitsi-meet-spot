import persistence from './persistence';

export function getPersistedState() {
    return {
        calendars: {
            name: persistence.get('calendar-name') || null
        },
        setup: {
            completed: persistence.get('setup-completed') || false,
            apiKey: persistence.get('setup-api-key'),
            clientId: persistence.get('setup-client-id')
        }
    };
}

export function setPersistedState(store) {
    persistence.set('calendar-name', store.getState().calendars.name);
    persistence.set('setup-completed', store.getState().setup.completed);
    persistence.set('setup-api-key', store.getState().setup.apiKey);
    persistence.set('setup-client-id', store.getState().setup.clientId);
}
