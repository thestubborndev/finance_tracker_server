const _ = require('lodash');
const plaid = require('plaid');
var prompt = require('prompt');
const config = require('../config');
const plaidClient = new plaid.Client(config.plaidCredentials.clientId, config.plaidCredentials.secret, plaid.environments.tartan);

prompt.colors = false;
prompt.message = '';
prompt.delimiter = ':';

prompt.start();
console.log(`
    Welcome to the Plaid Access Token Fetcher
    This is written as a command-line tool so that you don't ever have
    to store your online banking credentials to disk in the process of
    retrieving an accessToken.
`);
prompt.get([
    {
        name: 'onlineBankingUsername',
        description: 'Your online banking username',
    }, {
        name: 'onlineBankingPassword',
        description: 'Your online banking password',
    }, {
        name: 'financialInstitution',
        description: 'Financial institution code',
        // Source: https://plaid.com/docs/api/#institution-overview
        pattern: /(amex|bofa|capone360|schwab|chase|citi|fidelity|nfcu|pnc|suntrust|td|us|usaa|wells)/,
        message: 'Financial institution must be one of: amex, bofa, capone360, schwab, chase, citi, fidelity, nfcu, pnc, suntrust, td, us, usaa or wells'
    }], function(err, result) {
    if (err) { console.log(err); return; }

    // NOTE: This helper script assumes you do not have MFA enabled for your online
    // banking account. If you do, visit https://github.com/plaid/plaid-node#examples
    // to further customize this script to your particular situation
    plaidClient.addAuthUser(result.financialInstitution, {
        username: result.onlineBankingUsername,
        password: result.onlineBankingPassword,
    }, function(innerErr, mfaResponse, response) {
        if (innerErr) {
            // Bad request - invalid credentials, account locked, etc.
            console.error(innerErr);
        } else if (mfaResponse) {
            console.error(new Error(`
                Looks like MFA is enabled for your account.
                See the comment above.
            `));
        } else {
            // No MFA required - response body has accounts
            console.log(`Your Access Token is: ${response.access_token}. Copy this value into the config.js file.`);
        }
    });

});
