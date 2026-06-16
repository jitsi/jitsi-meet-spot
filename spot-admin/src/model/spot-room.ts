import { generateExpiresAndExpiresIn, generateRandomString } from '../backend/utils.js';
import type { ExpiresInfo, PairingCodeStructure, SpotRoomOptions, TokenStructure } from '../types.js';

const ACCESS_TOKEN_DURATION = 60 * 60 * 1000;
const SHORT_LIVED_TOKEN_DURATION = 60 * 60 * 1000;

const LONG_LIVED_PAIRING_CODE_DURATION = 60 * 60 * 1000;
const SHORT_LIVED_PAIRING_CODE_DURATION = 10 * 60 * 1000;

/**
 * Returns whether an expiry-bearing structure is missing or expired.
 *
 * @param struct - The structure to test.
 * @returns True if absent or past its expiry.
 */
function _expired(struct: ExpiresInfo | undefined): boolean {
    return !struct || Date.now() >= struct.expires;
}

/**
 * In-memory model for a single mock Spot room, holding the four credential
 * structures the backend hands out (access token, short-lived access token,
 * long-lived pairing code and short-lived/remote pairing code).
 */
export class SpotRoom {
    id: string;
    countryCode?: string;
    mucUrl: string;
    name?: string;
    tenant?: string;

    private _accessToken!: TokenStructure;
    private _shortLivedToken!: TokenStructure;
    private _pairingCode!: PairingCodeStructure;
    private _remotePairingCode!: PairingCodeStructure;
    private _seedRefreshToken?: string;

    /**
     * Creates a new room and seeds all four credential structures.
     *
     * @param id - The Spot room ID.
     * @param options - Optional seed values.
     */
    constructor(id: string, { countryCode, jwt, refreshToken, shortLivedJwt, name, tenant }: SpotRoomOptions) {
        this.id = id;
        this._seedRefreshToken = refreshToken;
        this.generateLongLivedPairingCode('12345678');
        this.regenerateAccessToken(jwt);
        this.regenerateShortLivedAccessToken(shortLivedJwt);
        this.generateShortLivedPairingCode();
        this.countryCode = countryCode;
        this.mucUrl = id;
        this.name = name;
        this.tenant = tenant;
    }

    /**
     * Regenerates the long-lived access token, preserving the refresh token.
     *
     * @param jwt - Optional explicit access token to use.
     * @returns The new access token structure.
     */
    regenerateAccessToken(jwt?: string): TokenStructure {
        // Preserve any existing refresh token across regenerations; otherwise fall back to the
        // seeded one (if provided) before generating a random one. The seed keeps the refresh
        // token deterministic for the E2E backend tests.
        const newRefreshToken
            = this._accessToken?.refreshToken ?? this._seedRefreshToken ?? `refresh${generateRandomString()}`;

        this._accessToken = {
            accessToken: jwt || generateRandomString(),
            refreshToken: newRefreshToken,
            ...generateExpiresAndExpiresIn(ACCESS_TOKEN_DURATION)
        };

        console.info(`Generated new access token ${this}`);

        return this._accessToken;
    }

    /**
     * Regenerates the short-lived access token (no refresh token).
     *
     * @param jwt - Optional explicit access token to use.
     * @returns The new short-lived access token structure.
     */
    regenerateShortLivedAccessToken(jwt?: string): TokenStructure {
        this._shortLivedToken = {
            accessToken: jwt || generateRandomString(),
            ...generateExpiresAndExpiresIn(SHORT_LIVED_TOKEN_DURATION)
        };

        console.info(`Generated new short lived access token ${this}`);

        return this._shortLivedToken;
    }

    /**
     * Returns the access token, regenerating it lazily if expired.
     *
     * @returns The access token structure.
     */
    getAccessToken(): TokenStructure {
        if (_expired(this._accessToken)) {
            this.regenerateAccessToken();
        }

        return this._accessToken;
    }

    /**
     * Returns the short-lived access token, regenerating it lazily if expired.
     *
     * @returns The short-lived access token structure.
     */
    getShortLivedAccessToken(): TokenStructure {
        if (_expired(this._shortLivedToken)) {
            this.regenerateShortLivedAccessToken();
        }

        return this._shortLivedToken;
    }

    /**
     * Returns the long-lived pairing code, regenerating it lazily if expired.
     *
     * @returns The long-lived pairing code structure.
     */
    getLongLivedPairingCode(): PairingCodeStructure {
        if (_expired(this._pairingCode)) {
            this.generateLongLivedPairingCode();
        }

        return this._pairingCode;
    }

    /**
     * Returns the short-lived (remote) pairing code, regenerating it lazily if expired.
     *
     * @returns The short-lived pairing code structure.
     */
    getShortLivedPairingCode(): PairingCodeStructure {
        if (_expired(this._remotePairingCode)) {
            this.generateShortLivedPairingCode();
        }

        return this._remotePairingCode;
    }

    /**
     * Generates a new long-lived pairing code.
     *
     * @param pairingCode - Optional explicit code to use.
     * @returns The new long-lived pairing code structure.
     */
    generateLongLivedPairingCode(pairingCode?: string): PairingCodeStructure {
        this._pairingCode = {
            code: pairingCode || generateRandomString(8),
            ...generateExpiresAndExpiresIn(LONG_LIVED_PAIRING_CODE_DURATION)
        };

        console.info(`Generated new long lived pairing code ${this}`);

        return this._pairingCode;
    }

    /**
     * Generates a new short-lived (remote) pairing code.
     *
     * @returns The new short-lived pairing code structure.
     */
    generateShortLivedPairingCode(): PairingCodeStructure {
        this._remotePairingCode = {
            code: generateRandomString(6),
            ...generateExpiresAndExpiresIn(SHORT_LIVED_PAIRING_CODE_DURATION)
        };

        console.info(`Generated new short lived pairing code ${this}`);

        return this._remotePairingCode;
    }

    /**
     * Renders the room and all four credentials for console logging.
     *
     * @returns A debug string.
     */
    toString(): string {
        return `SpotRoom[id: ${this.id},`
            + ` AT: ${this._accessToken?.accessToken}`
            + ` RT: ${this._accessToken?.refreshToken}`
            + ` LLPC: ${this._pairingCode?.code}`
            + ` SLPC: ${this._remotePairingCode?.code}`
            + ` SLAT: ${this._shortLivedToken?.accessToken}]`;
    }
}

/** The collection of mock rooms, keyed by room id. */
export type Spots = Map<string, SpotRoom>;
