/**
 * Executes timeouts and proceeds to the next promise chain.
 *
 * @returns
 */
export function tickProcess(): Promise<void> {
    jest.runAllTimers();

    return new Promise(resolve => process.nextTick(resolve));
}

/**
 * Executes a function a specified number of times.
 *
 * @param func - The function to invoke.
 * @param count - How many times to invoke the function.
 * @returns
 */
export function runNTimes(func: () => void, count: number): void {
    for (let i = 0; i < count; i++) {
        func();
    }
}

/**
 * A shorthand for running 'jest.runAllTimers()' with doing {@code tickProcess} each time.
 *
 * @param n - How many times repeat the run timers and tick process sequence.
 * @returns
 */
export function runAllTimersNTimes(n: number): Promise<void> {
    let ticks = tickProcess();

    runNTimes(() => {
        ticks = ticks.then(() => tickProcess());
    }, n);

    return ticks;
}
