import { nativeController } from '../native-controller';

/**
 * Signals the electron process to quit.
 *
 * @returns {voids}
 */
export function exitApp() {
    nativeController.sendMessage('exitApp');
}
