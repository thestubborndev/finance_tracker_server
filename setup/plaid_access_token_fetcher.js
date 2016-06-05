const _ = require('lodash');
const plaid = require('plaid');
const config = require('../config');
const plaidClient = new plaid.Client(config.plaidCredentials.clientId, config.plaidCredentials.secret, plaid.environments.tartan);

// Source: https://plaid.com/docs/api/#institution-overview
const institutionList = ['amex', 'bofa', 'capone360', 'schwab', 'chase', 'citi', 'fidelity', 'nfcu', 'pnc ', 'suntrust', 'td', 'us', 'usaa', 'wells'];
const Institutions = _.zipObject(institutionList, institutionList);

// TODO: Fill out the following three constants with your online banking details
// and the institution you bank with. After generating and saving your access
// token, remove your credentials from here before you continue! Safety first kids!
const ONLINE_BANKING_USERNAME = 'YOUR_ONLINE_BANKING_USERNAME';
const ONLINE_BANKING_PASSWORD = 'YOUR_ONLINE_BANKING_PASSWORD';
const INSTITUTION = Institutions.bofa;

// NOTE: This helper script assumes you do not have MFA enabled for your online
// banking account. If you do, visit https://github.com/plaid/plaid-node#examples
// to further customize this script to your particular situation

plaidClient.addAuthUser(INSTITUTION, {
    username: ONLINE_BANKING_USERNAME,
    password: ONLINE_BANKING_PASSWORD,
}, function(err, mfaResponse, response) {
    if (err) {
        // Bad request - invalid credentials, account locked, etc.
        throw err;
    } else if (mfaResponse) {
        throw new Error(`
            Looks like MFA is enabled for your account.
            See the comment above.
        `);
    } else {
        // No MFA required - response body has accounts
        console.log(`Your Access Token is: ${response.access_token}. Copy this value into the config.js file.`);
    }
});
