/**
 * Helper class to generate random values one by one, using an auxiliary
 * pool to avoid calling getRandomValues every time.
 */
class RandomPool {
    /**
     * Default size for the pool.
     */
    SIZE = 256;

    /**
     * Build a new pool.
     */
    constructor() {
        this._rArray = new Uint8Array(this.SIZE);
        this._idx = this.SIZE; // Fill the pool on first use.
    }

    /**
     * Gets a random number in the Uint8 range.
     *
     * @returns {number}
     */
    getValue() {
        if (this._idx > this.SIZE - 1) {
            // Fill the pool.
            window.crypto.getRandomValues(this._rArray);
            this._idx = 0;
        }

        return this._rArray[this._idx++];
    }
}

const pool = new RandomPool();

/**
 * Choose `num` elements from `seq`, randomly.
 *
 * @param {string} seq - Sequence of characters, the alphabet.
 * @param {number} num - The amount of characters from the alphabet we want.
 * @returns {string}
 */
function randomChoice(seq, num) {
    const x = seq.length - 1;
    const r = new Array(num);
    let len = num;

    while (len--) {
        // Make sure the random value is in our alphabet's range.
        // eslint-disable-next-line no-bitwise
        const idx = pool.getValue() & x;

        r.push(seq[idx]);
    }

    return r.join('');
}

/**
 * This alphabet removes all potential ambiguous symbols, so it's well suited for a code.
 */
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * A method to generate a random string, intended to be used to create a random join code.
 *
 * @param {number} length - The desired length of the random string.
 * @returns {string}
 */
export function generateRandomString(length) {
    return randomChoice(BASE32, length);
}

/**
 * This alphabet is similar to BASE32 above, but includes lowercase characters too.
 */
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Generates a random 8 character long string.
 *
 * @returns {string}
 */
export function generate8Characters() {
    return randomChoice(BASE58, 8);
}
