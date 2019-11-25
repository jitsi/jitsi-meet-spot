import {
    BOOTSTRAP_COMPLETE,
    getRemoteJoinCode,
    getUltrasoundConfig
} from 'common/app-state';
import { MiddlewareRegistry, StateListenerRegistry } from 'common/redux';
import { logger } from 'common/logger';

import ultrasoundService from './ultrasoundService';

StateListenerRegistry.register(
    state => getRemoteJoinCode(state),
    joinCode => ultrasoundService.setMessage(joinCode)
);

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

        ultrasoundService.initialize(EMSCRIPTEN_PATH, MEM_INITIALIZER_PATH)
            .catch(error => logger.error('Failed to initialize ultrasound', { error }));

        break;
    }
    }

    return next(action);
});
