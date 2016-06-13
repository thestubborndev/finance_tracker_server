const Currencies = require('./currencies/currencies');

const config = {
    airtableCredentials: {
        apiKey: process.env.AIRTABLE_API_KEY,
        appId: process.env.AIRTABLE_APP_ID,
    },
    airtableCurrenciesTable: {
        name: 'Currencies',
        priceFieldName: 'Price',
        symbolFieldName: 'Symbol',
    },
    airtableAssetsTable: {
        name: 'Assets',
        fundsFieldName: 'Funds',
        amountFieldName: 'Amount',
    },
    openExchangeCredentials: {
        apiKey: process.env.OPEN_EXCHANGE_API_KEY,
    },
    plaidCredentials: {
        clientId: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        // Maps the identifying 'Name' field value in the 'Assets' table in Airtable
        // with the Plaid accessToken associated with the asset bank account
        airtableAssetNameToAccessToken: {
            'Chase Bank Balance': process.env.PLAID_ACCESS_TOKEN_FOR_CHASE_ACCOUNT,
        },
    },
    // Add to this list the crypto-assets you wish to update
    // All possible assets listed in: crypto_assets.js
    cryptoAssetsToUpdate: [
        Currencies['ethereum'],
        Currencies['bitcoin'],
        Currencies['the-dao'],
    ],
    // Add to this list the fiat currencies you wish to update
    // All possible Fiat Currencies listed in: fiat_currencies.js
    fiatCurrenciesToUpdate: [
        Currencies['CHF'],
    ],
};

module.exports = config;
