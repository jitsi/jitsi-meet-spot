/**
 * Executes timeouts and proceeds to the next promise chain.
 *
 * @returns {Promise}
 */
export function tickProcess() {
    jest.runAllTimers();

    return new Promise(resolve => process.nextTick(resolve));
}

/**
 * Executes a function a specified number of times.
 *
 * @param {Function} func - The function to invoke.
 * @param {number} count - How many times to invoke the function.
 * @returns {void}
 */
export function runNTimes(func, count) {
    for (let i = 0; i < count; i++) {
        func();
    }
}

/**
 * A shorthand for running 'jest.runAllTimers()' with doing {@code tickProcess} each time.
 *
 * @param {number} n - How many times repeat the run timers and tick process sequence.
 * @returns {Promise}
 */
export function runAllTimersNTimes(n) {
    let ticks = tickProcess();

    runNTimes(() => {
        ticks = ticks.then(() => tickProcess());
    }, n);

    return ticks;
}
