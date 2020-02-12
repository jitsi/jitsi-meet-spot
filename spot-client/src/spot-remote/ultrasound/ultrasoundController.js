import {
    BOOTSTRAP_COMPLETE,
    getRemoteJoinCode,
    getUltrasoundConfig
} from 'common/app-state';
import { MiddlewareRegistry, StateListenerRegistry } from 'common/redux';
import { logger } from 'common/logger';

import UltrasoundTransmitter from './UltrasoundTransmitter';

MiddlewareRegistry.register(({ getState }) => next => action => {
    switch (action.type) {
    case BOOTSTRAP_COMPLETE: {
        const {
            EMSCRIPTEN_PATH,
            MEM_INITIALIZER_PATH,
            SUPPORTED_ENV_REGEX
        } = getUltrasoundConfig(getState());

        if (typeof EMSCRIPTEN_PATH === 'undefined'
            || typeof MEM_INITIALIZER_PATH === 'undefined'
            || typeof SUPPORTED_ENV_REGEX === 'undefined') {
            break;
        }

        const envRegex = new RegExp(SUPPORTED_ENV_REGEX);

        if (!envRegex.exec(window.navigator.userAgent.toLocaleLowerCase())) {
            break;
        }

        UltrasoundTransmitter.loadDependencies(EMSCRIPTEN_PATH, MEM_INITIALIZER_PATH)
            .then(() => {
                logger.log('ultrasound initialized successfully');

                const currentRemoteJoinCode = getRemoteJoinCode(getState());
                const ultrasoundTransmitter = new UltrasoundTransmitter(3000, currentRemoteJoinCode);

                StateListenerRegistry.register(
                    state => getRemoteJoinCode(state),
                    joinCode => {
                        if (joinCode) {
                            ultrasoundTransmitter.sendMessage(joinCode);
                        } else {
                            ultrasoundTransmitter.stopSending();
                        }
                    }
                );
            })
            .catch(error => logger.error('Failed to initialize ultrasound', { error }));

        break;
    }
    }

    return next(action);
});
