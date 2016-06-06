require('babel-core/register');
require('babel-polyfill');
const _ = require('lodash');
const express = require('express');
const config = require('./config');
const Currencies = require('./currencies');
const accountSync = require('./account_sync');

// deAsync allows us to convert an ES6 Async/Await function to a callback function
// as required by express route handlers.
// Borrowed from: https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
let deAsync = fn => (...args) => fn(...args).catch(args[2]);

const app = express();

app.get('/:airtableId', deAsync(async function(req, res) {
    const airtableId = req.params.airtableId;
    if (airtableId.length !== 17 || (airtableId.slice(0, 3) !== 'tbl' && airtableId.slice(0, 3) !== 'app')) {
        res.status(400).send('Invalid Request');
        return;
    }

    try {
        await accountSync.fetchAndUpdateCryptoAssetsAsync();
        // If no openExchangeRates API key specified, don't update fiat currencies
        if (config.openExchangeRates.apiKey) {
            await accountSync.fetchAndUpdateFiatCurrenciesAsync();
        }
        // If an accessToken is not specified in the config file, do not attempt
        // to update the account balance
        if (config.plaidCredentials.accessToken) {
            await accountSync.fetchAndUpdateBankBalanceAsync();
        }
    } catch (err) {
        console.log('Error Encountered:', err);
        res.status(400).send('An Error Occurred');
        return;
    }
    res.redirect(`https://airtable.com/${airtableId}`);
}));

const port = process.env.INVESTMENT_TRACKER_PORT || 80;
app.listen(port, () => {
    console.log(`Server Running... If running locally, visit: localhost:${port}/${config.airtableCredentials.appId}`);
});
