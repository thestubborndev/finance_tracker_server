const Currencies = require('./currencies');
const Holdings = require('./holdings');

const config = {
    airtableCredentials: {
        apiKey: process.env.AIRTABLE_API_KEY,
        appId: 'appy7d4XIf7m0TDgM',
    },
    currencyToRecordId: {
        [Currencies.ether]: 'recDqOyG5rOGmbSgx',
        [Currencies.bitcoin]: 'recg2UNdVtKRpA9AH',
        [Currencies.swissFranks]: 'recMiv9jX8PIfLEmw',
    },
    holdingToRecordId: {
        [Holdings.chaseBank]: 'recDhlsWyFupq66uy',
    },
    openExchangeCredentials: {
        apiKey: process.env.OPEN_EXCHANGE_API_KEY,
    },
    plaidCredentials: {
        clientId: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        accessToken: process.env.PLAID_ACCESS_TOKEN,
    },
};

module.exports = config;
