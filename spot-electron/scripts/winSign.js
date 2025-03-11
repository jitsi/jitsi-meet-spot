/* eslint-disable no-console */

const { execSync } = require('child_process');
const process = require('process');

exports.default = async function(configuration) {
    if (!process.env.CODE_SIGNER_KEYPAIR_ALIAS) {
        console.info('No parameters found, skipping signing...');
        return;
    }
    if(configuration.path) {
        execSync(`smctl sign --keypair-alias=${process.env.CODE_SIGNER_KEYPAIR_ALIAS} --input "${configuration.path}"`);
    }
};
