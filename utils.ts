import { defaultLogger } from './logger';
import 'dotenv/config'
const AUTH_SERVER = process.env.AUTH_SERVER || "";

/**
 * Formats a given number of bytes into a human-readable string representation.
 *
 * @param {number} bytes - The number of bytes to format.
 * @param {number} [decimals=2] - The number of decimal places to round to. Defaults to 2.
 * @return {string} The formatted string representation of the bytes.
 * @throws {Error} If the input is not a positive number.
 */
export function formatBytes(bytes: number, decimals = 2): string {
    const logger = defaultLogger('utils');
    // logger.info("Formatting bytes " + bytes);
    if (!Number.isFinite(bytes) || bytes < 0) {
        throw new Error('Invalid input. "bytes" must be a positive number.');
    }

    if (decimals < 0) {
        decimals = 0;
    }

    const k = 1024;
    const sizes = [
        'Bytes',
        'KiB',
        'MiB',
        'GiB',
        'TiB',
        'PiB',
        'EiB',
        'ZiB',
        'YiB'
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
        sizes[i]
    }`;
}

/**
 * Retrieves the username from the specified server.
 *
 * @return {Promise<string>} A promise that resolves to the username.
 */
export const getUsernameAndPasswordPair = async (): Promise<string> => {
    const response = await fetch(AUTH_SERVER);
    const json = await response.json();
    return json.username + ":" + json.password;
};