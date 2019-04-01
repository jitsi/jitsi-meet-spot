import { generateGuid } from './cryptography';
import persistence from './persistence';

/**
 * Obtains the device ID. It's generated randomly on the first run and the retrieved from storage.
 * That means the ID is persisted between the browser sessions.
 *
 * @returns {string}
 */
export function getDeviceId() {
    const deviceId = persistence.get('deviceId') || generateGuid();

    persistence.set('deviceId', deviceId);

    return deviceId;
}
