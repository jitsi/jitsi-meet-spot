import { execSync } from 'node:child_process';

/** The subset of the electron-builder custom-sign configuration this hook uses. */
interface WindowsSignConfiguration {
    path?: string;
}

/**
 * electron-builder Windows `sign` hook that signs the given artifact with
 * `smctl` when the signing keypair alias is present in the environment.
 *
 * @param configuration - The electron-builder custom-sign configuration.
 * @returns {Promise<void>}
 */
export default async function sign(configuration: WindowsSignConfiguration): Promise<void> {
    if (!process.env.CODE_SIGNER_KEYPAIR_ALIAS) {
        console.info('No parameters found, skipping signing...');

        return;
    }

    if (configuration.path) {
        console.info(`Signing: ${configuration.path}`);

        try {
            const out = execSync(
                `smctl sign --verbose --keypair-alias=${process.env.CODE_SIGNER_KEYPAIR_ALIAS}`
                    + ` --input="${configuration.path}"`
            );

            if (out.toString().includes('FAILED')) {
                throw new Error(out.toString());
            }
        } catch (err) {
            console.error(`Failed to sign: ${configuration.path}`);
            console.error(err);
            process.exit(1);
        }

        console.info(`Signed: ${configuration.path}`);
    }
}
