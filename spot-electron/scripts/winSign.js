/* eslint-disable no-console */

const { execSync } = require('child_process');
const process = require('process');

exports.default = async function(configuration) {
    if (!process.env.CODE_SIGNER_KEYPAIR_ALIAS) {
        console.info('No parameters found, skipping signing...');
        return;
    }
    if (configuration.path) {
        console.info(`Signing: ${configuration.path}`);

        try {
            const out = execSync(`smctl sign --keypair-alias=${process.env.CODE_SIGNER_KEYPAIR_ALIAS} --input "${configuration.path}"`);

            if (out.toString().includes('FAILED')) {
                throw new Error(out.toString());
            }
        } catch(err) {
            console.error(`Failed to sign: ${configuration.path}`);
            console.error(err);
            process.exit(1);
        }

        console.info(`Signed: ${configuration.path}`);
    }
};
